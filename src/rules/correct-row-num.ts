// import stringify from "json-stringify-safe";
import { fixRowNums } from "js-row-num";
console.log(`003 ███████████████████████████████████████`);

export interface Obj {
  [key: string]: any;
}

const create = (context: Obj): Obj => {
  return {
    CallExpression(node: Obj) {
      // console.log(stringify(node, null, 4));
      console.log(`013 node.callee.type = ${node.callee.type}`);

      /* istanbul ignore else */
      if (
        node.callee &&
        node.callee.type === "MemberExpression" &&
        node.callee.object &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "console" &&
        node.callee.property &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "log" &&
        node.arguments &&
        Array.isArray(node.arguments) &&
        node.arguments.length
      ) {
        console.log(`029 ██ `);
        node.arguments.forEach((arg) => {
          console.log(`031 arg.raw: ${arg.raw}`);
          // console.log(
          //   `033 ${`\u001b[${35}m${`██`}\u001b[${39}m`} ${stringify(
          //     arg,
          //     null,
          //     4
          //   )}`
          // );

          // if the updated console.log contents are different from what we
          // have now, latter needs to be updated.
          if (
            arg.type === "Literal" &&
            typeof arg.raw === "string" &&
            arg.raw !==
              fixRowNums(arg.raw, {
                overrideRowNum: arg.loc.start.line,
                returnRangesOnly: false,
                extractedLogContentsWereGiven: true,
              })
          ) {
            console.log(
              `053 ${`\u001b[${32}m${`we have console.log with single or double quotes`}\u001b[${39}m`}`
            );
            context.report({
              node,
              messageId: "correctRowNum",
              fix: (fixerObj: Obj) => {
                const ranges = fixRowNums(arg.raw, {
                  overrideRowNum: arg.loc.start.line,
                  returnRangesOnly: true, // <------ now we request ranges
                  extractedLogContentsWereGiven: true,
                });
                console.log(
                  `065 ${`\u001b[${33}m${`ranges`}\u001b[${39}m`} = ${JSON.stringify(
                    ranges,
                    null,
                    4
                  )}`
                );
                console.log(
                  `072 ${`\u001b[${33}m${`arg.start`}\u001b[${39}m`} = ${JSON.stringify(
                    arg.start,
                    null,
                    4
                  )} (type ${typeof arg.start})`
                );
                if (ranges) {
                  let offset = arg.start;
                  if (
                    !offset &&
                    arg.range &&
                    typeof arg.range[0] === "number"
                  ) {
                    offset = arg.range[0];
                  }

                  const preppedRanges = [
                    offset + ranges[0][0],
                    offset + ranges[0][1],
                  ];
                  console.log(
                    `093 ${`\u001b[${33}m${`preppedRanges`}\u001b[${39}m`} = ${JSON.stringify(
                      preppedRanges,
                      null,
                      4
                    )}`
                  );
                  return fixerObj.replaceTextRange(preppedRanges, ranges[0][2]);
                }
              },
            });
          } else if (
            arg.type === "TemplateLiteral" &&
            Array.isArray(arg.quasis) &&
            arg.quasis.length &&
            typeof arg.quasis[0] === "object" &&
            arg.quasis[0].value &&
            arg.quasis[0].value.raw &&
            arg.quasis[0].value.raw !==
              fixRowNums(arg.quasis[0].value.raw, {
                overrideRowNum: arg.loc.start.line,
                returnRangesOnly: false,
                extractedLogContentsWereGiven: true,
              })
          ) {
            console.log(
              `118 ${`\u001b[${32}m${`we have console.log with backticks`}\u001b[${39}m`}`
            );
            context.report({
              node,
              messageId: "correctRowNum",
              fix: (fixerObj: Obj) => {
                const ranges = fixRowNums(arg.quasis[0].value.raw, {
                  overrideRowNum: arg.loc.start.line,
                  returnRangesOnly: true, // <------ now we request ranges
                  extractedLogContentsWereGiven: true,
                });
                console.log(
                  `130 ${`\u001b[${32}m${`SET`}\u001b[${39}m`} ${`\u001b[${33}m${`ranges`}\u001b[${39}m`} = ${JSON.stringify(
                    ranges,
                    null,
                    4
                  )}`
                );
                if (ranges) {
                  let offset = arg.quasis[0].range[0] + 1;
                  console.log(
                    `139 ${`\u001b[${32}m${`SET`}\u001b[${39}m`} ${`\u001b[${33}m${`offset`}\u001b[${39}m`} = ${JSON.stringify(
                      offset,
                      null,
                      4
                    )}`
                  );
                  if (
                    !offset &&
                    arg.range &&
                    typeof arg.range[0] === "number"
                  ) {
                    offset = arg.quasis[0].start + 1; // compensate plus one for the back-tick
                    console.log(
                      `152 ${`\u001b[${32}m${`SET`}\u001b[${39}m`} ${`\u001b[${33}m${`offset`}\u001b[${39}m`} = ${JSON.stringify(
                        offset,
                        null,
                        4
                      )}`
                    );
                  }

                  const preppedRanges = [
                    offset + ranges[0][0],
                    offset + ranges[0][1],
                  ];
                  console.log(
                    `165 ${`\u001b[${32}m${`SET`}\u001b[${39}m`} ${`\u001b[${33}m${`preppedRanges`}\u001b[${39}m`} = ${JSON.stringify(
                      preppedRanges,
                      null,
                      4
                    )}`
                  );

                  return fixerObj.replaceTextRange(preppedRanges, ranges[0][2]);
                }
              },
            });
          }
        });
      }
    },
  };
};

export default {
  create,
  meta: {
    // docs: {
    //   url: getDocumentationUrl(__filename),
    // },
    type: "suggestion",
    messages: {
      correctRowNum: "Update the row number.",
    },
    fixable: "code", // or "code" or "whitespace"
  },
};
