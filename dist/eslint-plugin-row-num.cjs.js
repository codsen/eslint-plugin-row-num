/**
 * @name eslint-plugin-row-num
 * @fileoverview ESLint plugin to update row numbers on each console.log
 * @version 2.0.0
 * @author Roy Revelt, Codsen Ltd
 * @license MIT
 * {@link https://codsen.com/os/eslint-plugin-row-num/}
 */

'use strict';

var jsRowNum = require('js-row-num');

const create = context => {
  return {
    CallExpression(node) {
      /* istanbul ignore else */
      if (node.callee && node.callee.type === "MemberExpression" && node.callee.object && node.callee.object.type === "Identifier" && node.callee.object.name === "console" && node.callee.property && node.callee.property.type === "Identifier" && node.callee.property.name === "log" && node.arguments && Array.isArray(node.arguments) && node.arguments.length) {
        node.arguments.forEach(arg => {
          if (arg.type === "Literal" && typeof arg.raw === "string" && arg.raw !== jsRowNum.fixRowNums(arg.raw, {
            overrideRowNum: arg.loc.start.line,
            returnRangesOnly: false,
            extractedLogContentsWereGiven: true
          })) {
            context.report({
              node,
              messageId: "correctRowNum",
              fix: fixerObj => {
                const ranges = jsRowNum.fixRowNums(arg.raw, {
                  overrideRowNum: arg.loc.start.line,
                  returnRangesOnly: true,
                  extractedLogContentsWereGiven: true
                });
                if (ranges) {
                  let offset = arg.start;
                  if (!offset && arg.range && typeof arg.range[0] === "number") {
                    offset = arg.range[0];
                  }
                  const preppedRanges = [offset + ranges[0][0], offset + ranges[0][1]];
                  return fixerObj.replaceTextRange(preppedRanges, ranges[0][2]);
                }
              }
            });
          } else if (arg.type === "TemplateLiteral" && Array.isArray(arg.quasis) && arg.quasis.length && typeof arg.quasis[0] === "object" && arg.quasis[0].value && arg.quasis[0].value.raw && arg.quasis[0].value.raw !== jsRowNum.fixRowNums(arg.quasis[0].value.raw, {
            overrideRowNum: arg.loc.start.line,
            returnRangesOnly: false,
            extractedLogContentsWereGiven: true
          })) {
            context.report({
              node,
              messageId: "correctRowNum",
              fix: fixerObj => {
                const ranges = jsRowNum.fixRowNums(arg.quasis[0].value.raw, {
                  overrideRowNum: arg.loc.start.line,
                  returnRangesOnly: true,
                  extractedLogContentsWereGiven: true
                });
                if (ranges) {
                  let offset = arg.quasis[0].range[0] + 1;
                  if (!offset && arg.range && typeof arg.range[0] === "number") {
                    offset = arg.quasis[0].start + 1;
                  }
                  const preppedRanges = [offset + ranges[0][0], offset + ranges[0][1]];
                  return fixerObj.replaceTextRange(preppedRanges, ranges[0][2]);
                }
              }
            });
          }
        });
      }
    }
  };
};
var correctRowNum = {
  create,
  meta: {
    type: "suggestion",
    messages: {
      correctRowNum: "Update the row number."
    },
    fixable: "code"
  }
};

var main = {
  configs: {
    recommended: {
      plugins: ["row-num"],
      rules: {
        "no-console": "off",
        "row-num/correct-row-num": "error"
      }
    }
  },
  rules: {
    "correct-row-num": correctRowNum
  }
};

module.exports = main;
