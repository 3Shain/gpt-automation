import Handlebars from "handlebars";
import qtmpl from "./template_question.html?raw";
import tmpl from "./template.html?raw";

const questionTemplate = Handlebars.compile(qtmpl);
const reportTemplate = Handlebars.compile(tmpl);

function generateAQuestion(
  qid: string,
  cid: string,
  body: string,
  answer: string
) {
  return questionTemplate({
    qid,
    cid,
    body,
    answer,
  });
}

export function generateReport(
  data: Array<{
    id: string;
    contextId: string;
    body: string;
    answerHTML: string;
  }>,
  presetId: string,
  prologue: string,
  epilogue: string
) {
  return reportTemplate({
    allQuestions: data
      .map((x) =>
        generateAQuestion(
          x.id,
          x.contextId,
          prologue + x.body + epilogue,
          x.answerHTML
        )
      )
      .join("\n"),
    pid: presetId,
  });
}
