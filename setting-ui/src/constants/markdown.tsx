import { Remarkable } from "remarkable"; // Markdown parser
import React from "react";

interface RenderMarkdownToHTMLResult {
  __html: string;
}

const renderMarkdownToHTML = (markdown: string): RenderMarkdownToHTMLResult => {
  const md = new Remarkable();
  const renderedHTML = md.render(markdown);
  return { __html: renderedHTML };
};

export const MarkdownPreview: React.FC<{ markdown: string }> = ({
  markdown,
}) => {
  const markup = renderMarkdownToHTML(markdown);
  return <div dangerouslySetInnerHTML={markup} />;
};
