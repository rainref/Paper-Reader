"""
MinerU Service - 使用本地模型将 PDF 转换为 Markdown
基于 MinerU-master 项目的 do_parse 方法
"""
import os
import logging
import json
from pathlib import Path
from typing import Optional, Dict, Any
import fitz  # PyMuPDF for page count

# 直接使用 uvicorn 的日志
logger = logging.getLogger("uvicorn")

from ..config import settings

# 从配置获取路径
LOCAL_MODEL_DIR = str(settings.mineru_model_dir)
LOCAL_VLM_MODEL = str(settings.get_mineru_vlm_model_path())
CACHE_ROOT_DIR = settings.mineru_cache_dir


def setup_local_model_config():
    """配置本地模型"""
    # 创建配置文件
    config = {
        "models-dir": {
            "pipeline": os.path.join(LOCAL_MODEL_DIR, "pipeline"),
            "vlm": LOCAL_VLM_MODEL
        }
    }

    # 将配置写入用户主目录
    home_dir = os.path.expanduser("~")
    config_path = os.path.join(home_dir, "mineru.json")

    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

    # 设置环境变量
    os.environ['MINERU_MODEL_SOURCE'] = 'local'

    return config_path


class MineruService:
    """MinerU 服务类，用于将 PDF 转换为 Markdown"""

    def __init__(self):
        self._initialized = False

    def initialize(self):
        """初始化 MinerU 配置"""
        if self._initialized:
            return

        try:
            # 配置本地模型
            config_path = setup_local_model_config()
            logger.info(f"MinerU config created: {config_path}")
            logger.info(f"Using local VLM model: {LOCAL_VLM_MODEL}")

            # 确保缓存目录存在
            CACHE_ROOT_DIR.mkdir(parents=True, exist_ok=True)

            self._initialized = True
            logger.info("MinerU service initialized successfully!")
        except Exception as e:
            logger.error(f"Failed to initialize MinerU: {e}")
            raise

    def get_pdf_page_count(self, pdf_path: Path) -> int:
        """获取 PDF 页数"""
        try:
            doc = fitz.open(str(pdf_path))
            count = doc.page_count
            doc.close()
            return count
        except Exception as e:
            logger.error(f"Error getting PDF page count: {e}")
            return 0

    def convert_pdf_to_markdown(self, pdf_path: Path, paper_id: str = None) -> Dict[str, Any]:
        """将 PDF 转换为 Markdown

        Args:
            pdf_path: PDF 文件路径
            paper_id: 论文 ID，用于创建独立的输出目录

        Returns:
            Dict with keys: markdown (str), total_pages (int)
        """
        if not self._initialized:
            self.initialize()

        if not paper_id:
            paper_id = pdf_path.stem

        # 获取 PDF 页数
        total_pages = self.get_pdf_page_count(pdf_path)

        try:
            from mineru.cli.common import do_parse, read_fn

            logger.info(f"Converting PDF: {pdf_path}, paper_id: {paper_id}")

            # 读取PDF文件
            pdf_bytes = read_fn(pdf_path)
            pdf_file_name = Path(pdf_path).stem


            # 调用do_parse进行转换
            # do_parse 会在 output_dir/internal_name/ 下生成结果
            do_parse(
                output_dir=CACHE_ROOT_DIR,
                pdf_file_names=[pdf_file_name],
                pdf_bytes_list=[pdf_bytes],
                p_lang_list=["ch"],
                backend="vlm-auto-engine",
                parse_method="auto",
                formula_enable=True,
                table_enable=True,
                f_draw_layout_bbox=False,
                f_draw_span_bbox=False,
                f_dump_md=True,
                f_dump_middle_json=False,
                f_dump_model_output=False,
                f_dump_orig_pdf=False,
                f_dump_content_list=False,
            )

            # 读取输出结果 - 在 vlm 子目录下
            output_md_path = CACHE_ROOT_DIR / pdf_file_name / "vlm" / f"{pdf_file_name}.md"

            content = None
            if output_md_path.exists():
                content = output_md_path.read_text(encoding='utf-8')

            if content is None:
                raise FileNotFoundError(f"Output markdown not found at {output_md_path}")

            # 转换图片路径为绝对路径
            content = self._convert_image_paths(content, paper_id)

            logger.info(f"Converted successfully! Content length: {len(content)} characters")

            return {
                "markdown": content,
                "total_pages": total_pages
            }

        except Exception as e:
            logger.error(f"Error during conversion: {e}")
            raise

    def _convert_image_paths(self, content: str, paper_id: str) -> str:
        """将 Markdown 中的相对图片路径转换为绝对路径"""
        import re
        # 匹配 ![](images/xxx.png) 或 ![alt](images/xxx.png)
        # 替换为 /api/papers/{paper_id}/markdown/images/xxx.png
        content = re.sub(
            r'!\[(.*?)\]\(images/([^)]+)\)',
            rf'![\1](/api/papers/{paper_id}/markdown/images/\2)',
            content
        )
        return content

    def get_cached_markdown(self, paper_id: str, pdf_path: Path) -> Optional[Dict[str, Any]]:
        """获取缓存的 Markdown（直接从 do_parse 输出目录读取）"""
        pdf_file_name = pdf_path.stem
        output_md_path = CACHE_ROOT_DIR / pdf_file_name / "vlm" / f"{pdf_file_name}.md"

        if output_md_path.exists():
            content = output_md_path.read_text(encoding='utf-8')
            # 转换图片路径
            content = self._convert_image_paths(content, paper_id)
            return {
                "markdown": content,
                "total_pages": 0  # 页数可以从其他地方获取
            }
        return None

    def get_image_path(self, paper_id: str, pdf_path: Path, image_name: str) -> Optional[Path]:
        """获取图片的完整路径"""
        pdf_file_name = pdf_path.stem
        img_path = CACHE_ROOT_DIR / pdf_file_name / "vlm" / "images" / image_name
        if img_path.exists():
            return img_path
        return None


# 全局单例（懒加载）
mineru_service = MineruService()
