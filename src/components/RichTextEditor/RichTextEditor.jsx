import React from "react";
import PropTypes from "prop-types";

import MDEditor from "@uiw/react-md-editor";

import {getCodeString} from "rehype-rewrite";
import katex from "katex";
import "katex/dist/katex.css";
import "./RichTextEditor.scss";

export default class RichTextEditor extends React.Component {
  render() {
    let enableEdit = this.props.enableEdit || false;
    return (
      <div className="rich-text-editor" data-color-mode="light">
        <div className="wmde-markdown-var"> </div>
        <MDEditor
          value={this.props.value}
          onChange={this.props.onChange}
          preview={enableEdit ? "live" : "preview"}
          hideToolbar={enableEdit ? false : true}
          height={enableEdit ? 200 : 600}
          {...this.props}
          // previewOptions={{
          //   rehypePlugins: [[rehypeSanitize]],
          //   components: {
          //     code: ({ inline, children = [], className, ...props }) => {
          //       // console.log(children)
          //       let ret = []
          //       children.forEach((txt) => {
          //         // const txt = children[0] || '';
          //         if (inline) {
          //           if (typeof txt === 'string' && /\$\$(.*)\$\$/.test(txt)) {
          //             const html = katex.renderToString(txt.replace(/\$\$(.*)\$\$/, '$1'), {
          //               throwOnError: false,
          //             });
          //             // return <code dangerouslySetInnerHTML={{ __html: html }} />;
          //             ret.push(<code dangerouslySetInnerHTML={{ __html: html }} />);
          //           return;
          //           }
          //           // return <code>{txt}</code>;
          //           ret.push(<code>{txt}</code>);
          //           return;
          //         }
          //         const code = props.node && props.node.children ? getCodeString(props.node.children) : txt;
          //         if (
          //           typeof code === 'string' &&
          //           typeof className === 'string' &&
          //           /language-katex/.test(className.toLocaleLowerCase())
          //         ) {
          //           const html = katex.renderToString(code, {
          //             throwOnError: false,
          //           });
          //           // return <code style={{ fontSize: '150%' }} dangerouslySetInnerHTML={{ __html: html }} />;
          //           ret.push(<code style={{ fontSize: '150%' }} dangerouslySetInnerHTML={{ __html: html }} />);
          //           return;
          //         }
          //         // return <code className={String(className)}>{txt}</code>;
          //         ret.push(<code className={String(className)}>{txt}</code>);
          //       })
          //       return <>{ret.map((comp, indx) => (
          //         <React.Fragment key={indx}>
          //           {comp}
          //         </React.Fragment>
          //       ))}</>
          //     },
          //   },
          // }}
          previewOptions={{
            components: {
              code: ({inline, children = [], className, ...props}) => {
                const txt = children[0] || "";
                if (inline) {
                  if (typeof txt === "string" && /^\$\$(.*)\$\$/.test(txt)) {
                    const html = katex.renderToString(
                      txt.replace(/^\$\$(.*)\$\$/, "$1"),
                      {
                        throwOnError: false,
                      }
                    );
                    return <code dangerouslySetInnerHTML={{__html: html}} />;
                  }
                  return <code>{txt}</code>;
                }
                const code =
                  props.node && props.node.children
                    ? getCodeString(props.node.children)
                    : txt;
                if (
                  typeof code === "string" &&
                  typeof className === "string" &&
                  /^language-katex/.test(className.toLocaleLowerCase())
                ) {
                  const html = katex.renderToString(code, {
                    throwOnError: false,
                  });
                  return (
                    <code
                      style={{fontSize: "150%"}}
                      dangerouslySetInnerHTML={{__html: html}}
                    />
                  );
                }
                return <code className={String(className)}>{txt}</code>;
              },
            },
          }}
        />
        {/* <MDEditor.Markdown source={this.props.value} style={{ whiteSpace: 'pre-wrap' }} /> */}
      </div>
    );
  }
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};
