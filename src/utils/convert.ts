import { render, renderRule } from "datocms-structured-text-to-html-string";
import { isCode } from "datocms-structured-text-utils";
import { rehype } from "rehype";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";
import { ExportButtonProps } from "./types";
import { ItemFormSidebarPanelsCtx, ItemType } from "datocms-plugin-sdk";

export async function convertToMarkdown(
  structuredText: any
): Promise<string | null> {
  const content = render(structuredText, {
    customRules: [
      renderRule(isCode, ({ adapter: { renderNode, renderText }, key, node }) =>
        renderNode(
          "pre",
          { key, class: `language-${node.language}` },
          renderNode(
            "code",
            { key, class: `language-${node.language}` },
            renderText(node.code)
          )
        )
      ),
    ],
  });

  if (!content) return null;

  const markdown = await rehype()
    .use(rehype2remark)
    .use(stringify)
    .process(content);

  return String(markdown);
}

export function hasStructuredText(
  itemType: ItemType,
  ctx: ItemFormSidebarPanelsCtx
) {
  const itemFieldIds = itemType.relationships.fields.data.map(
    (field) => field.id
  );

  const structuredTextFields = Object.values(ctx.fields)
    .filter((field) => itemFieldIds.includes(field!.id))
    .filter((field) => field?.attributes.field_type === "structured_text");

  return structuredTextFields.length > 0;
}

export function getRecordMetadata(ctx: ExportButtonProps["ctx"]): {
  title: string;
  structuredText: any;
} {
  const structuredTextField = Object.values(ctx.fields).find(
    (field) => field?.attributes.field_type === "structured_text"
  );

  const structuredText: any =
    ctx.item!.attributes[structuredTextField!.attributes.api_key!];

  let prefix = `${ctx.itemType.attributes.name} Export`;
  const suffix = new Date().toLocaleString();

  const titleFieldId = ctx.itemType.relationships.title_field.data?.id;

  if (titleFieldId) {
    const titleFieldKey = ctx.fields[titleFieldId]!.attributes.api_key;
    const titleFieldValue = ctx.item!.attributes[titleFieldKey] as string;

    if (titleFieldValue.length > 0) {
      prefix = titleFieldValue;
    }
  }

  const finalTitle = `${prefix} - ${suffix}`;

  return {
    title: finalTitle,
    structuredText,
  };
}
