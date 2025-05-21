from langchain_community.document_transformers import MarkdownifyTransformer
import re

# Custom transformer that extends the MarkdownifyTransformer to strip trailing newlines from code blocks
class CustomMarkdownifyTransformer(MarkdownifyTransformer):
    def transform_documents(self, documents):
        transformed_docs = super().transform_documents(documents)
        for doc in transformed_docs:
            if hasattr(doc, 'page_content'):
                doc.page_content = self._strip_trailing_newline_from_code_blocks(doc.page_content)
        return transformed_docs

    def _strip_trailing_newline_from_code_blocks(self, text):
        # Regex to find code blocks and ensure they end with a newline before the closing backticks
        code_block_pattern = re.compile(r'(```\w*\n[\s\S]*?)```')
        return code_block_pattern.sub(lambda match: match.group(1).rstrip() + '\n```', text)