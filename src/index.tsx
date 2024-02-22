import { render } from "solid-js/web";
import {
  Divider,
  HStack,
  HopeProvider,
  VStack,
  createDisclosure,
} from "@hope-ui/solid";
import { Button } from "@hope-ui/solid";
import { Textarea } from "@hope-ui/solid";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
} from "@hope-ui/solid";
import { saveAs } from "file-saver";
import "virtual:uno.css";
import { For, JSX, createEffect, createSignal } from "solid-js";
import { generateReport } from "./generate_report";
import katex from "katex";
import { convertToHtml } from "@unified-latex/unified-latex-to-hast";
import { parse } from "@unified-latex/unified-latex-util-parse";

function safeFileName(input: string) {
  // Remove special characters commonly not allowed in filenames
  let sanitized = input.replace(/[\/\\?%*:|"<>]/g, "_");

  // If you're on Windows, you might also want to remove characters like : or \
  // sanitized = input.replace(/[\/\\?%*:|"<>]/g, '_');

  // Truncate the filename if it's too long, for example, over 255 characters (common maximum on many file systems)
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

let textarea: HTMLTextAreaElement;
let submitButton: HTMLButtonElement;

function openAFile() {
  return new Promise<string | null>((res) => {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement)!.files![0];
      if (file == null) {
        res(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = (ev) => {
        res(ev.target!.result as string);
      };
    };
    input.click();
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}

function waitUntilResponse(): Promise<HTMLElement> {
  let responseStarted = false;

  return new Promise((res, rej) => {
    let confidence = 0;
    function check() {
      if (responseStarted) {
        if (
          [...document.querySelectorAll("div.text-token-text-primary.w-full")]
            .toReversed()[0]
            ?.querySelector(".result-streaming") === null
        ) {
          const final = [...document.querySelectorAll("div.text-token-text-primary.w-full")]
            .toReversed()[0]
            ?.querySelector(".markdown.prose");
          if (
            final &&
            !final.parentElement?.parentElement?.querySelector(
              "svg.text-brand-purple"
            )
          ) {
            confidence++;
            console.log("gain confidence");
            if (confidence > 10) {
              res(final.parentElement?.parentElement as HTMLElement);
              return;
            }
          } else {
            // rej(new Error("Detect response failed"));
            // maybe not reject it?
            confidence = 0;
          }
        }
      } else {
        if (
          [...document.querySelectorAll("div.text-token-text-primary.w-full")]
            .toReversed()[0]
            ?.querySelector(".result-streaming")
        ) {
          responseStarted = true;
        }
      }
      setTimeout(check, 100);
    }
    check();
  });
}

async function postMessage(content: string) {
  textarea = document.querySelector(
    '#prompt-textarea'
  ) as HTMLTextAreaElement;
  submitButton = textarea.nextElementSibling!.nextElementSibling as HTMLButtonElement;
  textarea.value = content;

  const inputEvent = new InputEvent("input", {
    bubbles: true,
    data: content,
    inputType: "insertFromPaste",
  });
  textarea.dispatchEvent(inputEvent);
  await wait(500);
  const keydownEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "Enter",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  });
  textarea.dispatchEvent(keydownEvent);
}

async function startRoutine() {
  const data: {
    id: string;
    contextId: string;
    body: string;
    answerHTML: string;
  }[] = [];
  let lastContext: any = null;
  const qqueue = [...questions().toReversed()];
  while (qqueue.length) {
    const q = qqueue.pop()!;
    if (lastContext != q.current.contextId) {
      console.log("context id differ, ");
      newTab.click();
      await wait(1000);
      console.log("switched to new contexts ");
    }
    console.log("post msg");
    await postMessage(prologue() + q.current.body + epilogue());
    console.log("post msg done.");
    const response = await waitUntilResponse();
    console.log("get response");
    // console.log(response);
    data.push({
      ...q.current,
      answerHTML: response.outerHTML,
    });
    lastContext = q.current.contextId;
    if (qqueue.length) {
      console.log("will wait 5000ms");
      await wait(5000);
    } else {
      break;
    }
    console.log("question end");
  }
  console.log("Done!");
  const blob = new Blob(
    [
      generateReport(
        data.map((x) => {
          return {
            ...x,
            body: generateRenderredBody(x.body),
          };
        }),
        presetId(),
        prologue(),
        epilogue()
      ),
    ],
    {
      type: "text/plain;charset=utf-8",
    }
  );
  saveAs(blob, `report_${presetId()}_${new Date().toLocaleString()}.html`);
}

interface QuestionState {
  UI: () => JSX.Element;
  current: {
    internalId: number;
    id: string;
    contextId: string;
    body: string;
  };
}

let internalIdSel = 0;

const CUSTOM_MACROS = {
  "\\RR": "\\mathbb{R}",
  "\\ZZ": "\\mathbb{Z}",
  "\\FF": "\\mathbb{F}",
  "\\CC": "\\mathbb{C}",
  // "\\rmfamily": "\\textbf",
};

const generateRenderredBody = (tex: string) => {
  const frag = document.createElement("div");
  frag.innerHTML = convertToHtml(parse(tex));
  // renderMathInText(frag, {
  //   delimiters: [
  //     { left: "$$", right: "$$", display: true },
  //     { left: "\\[", right: "\\]", display: true },
  //     { left: "$", right: "$", display: false },
  //     { left: "\\(", right: "\\)", display: false },
  //   ],
  //   //trust: true,
  //   //strict: false,
  // });
  // shadow = shadow ?? preview.attachShadow({ mode: "open" });
  for (const dm of Array.from(frag.querySelectorAll(".display-math"))) {
    katex.render(dm.textContent!, dm as HTMLElement, {
      displayMode: true,
      throwOnError: false,
      macros: CUSTOM_MACROS,
    });
  }
  for (const im of Array.from(frag.querySelectorAll(".inline-math"))) {
    katex.render(im.textContent!, im as HTMLElement, {
      displayMode: false,
      throwOnError: false,
      macros: CUSTOM_MACROS,
    });
  }
  return frag.innerHTML;
};

function createQuestionState(initial: {
  id: string;
  contextId: string;
  body: string;
}): QuestionState {
  const internalId = internalIdSel++;

  const [id, setId] = createSignal(initial.id);

  const [contextId, setContextId] = createSignal(initial.contextId);

  const [body, setBody] = createSignal(initial.body);

  return {
    UI: () => {
      let preview: HTMLDivElement = null!;

      createEffect(() => {
        preview.innerHTML = generateRenderredBody(body());
      });
      return (
        <>
          <FormControl required>
            <FormLabel for="qid">Question Id</FormLabel>
            <Input
              id="qid"
              value={id()}
              onInput={(e) => setId(e.target.value)}
            />
            <FormHelperText></FormHelperText>
          </FormControl>

          <FormControl required>
            <FormLabel for="qcid">Question Context Id</FormLabel>
            <Input
              id="cid"
              value={contextId()}
              onInput={(e) => setContextId(e.target.value)}
            />
            <FormHelperText>
              Question with the same context id will be feed into the same chat
              session.
            </FormHelperText>
          </FormControl>

          <FormControl required>
            <FormLabel for="body">Question Body</FormLabel>
            <Textarea
              id="body"
              value={body()}
              onInput={(e) => setBody(e.target.value)}
            />
            <FormHelperText></FormHelperText>
            <div ref={preview}></div>
          </FormControl>
        </>
      );
    },
    get current() {
      return {
        internalId,
        id: id(),
        contextId: contextId(),
        body: body(),
      };
    },
  };
}

const [presetId, setPresetId] = createSignal<string>("Unnamed Preset");
const [prologue, setPrologue] = createSignal<string>("");
const [epilogue, setEpilogue] = createSignal<string>("");
const [questions, setQuestions] = createSignal<QuestionState[]>([]);

function App() {
  const { isOpen, onOpen, onClose } = createDisclosure();

  const addQuestionAtIndex = (idx: number) => {
    setQuestions((current) => {
      return [
        ...current.slice(0, idx),
        createQuestionState({ id: "", contextId: "", body: "" }),
        ...current.slice(idx),
      ];
    });
  };

  return (
    <HopeProvider>
      <a
        onClick={() => {
          onOpen();
        }}
        class="flex h-10 w-full items-center gap-2 rounded-lg px-2 font-medium text-token-text-primary hover:bg-token-sidebar-surface-secondary"
      >
        <span class="truncate">Open Script Panel</span>
      </a>
      <Modal
        centered
        scrollBehavior="inside"
        size="full"
        opened={isOpen()}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Yeah it's a script.</ModalHeader>
          <ModalBody>
            <VStack spacing={"10px"}>
              {/* <Textarea
              value={value()}
              onInput={handleInput}
              placeholder="Paste questions here. Each line with one question."
            /> */}
              <FormControl>
                <FormLabel for="pid">Preset Name</FormLabel>
                <Input
                  id="pid"
                  value={presetId()}
                  onInput={(e) => setPresetId(e.target.value)}
                />
                <FormHelperText></FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel for="pid">Prologue (for each question)</FormLabel>
                <Textarea
                  id="pid"
                  value={prologue()}
                  onInput={(e) => setPrologue(e.target.value)}
                />
                <FormHelperText></FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel for="pid">Epilogue (for each question)</FormLabel>
                <Textarea
                  id="pid"
                  value={epilogue()}
                  onInput={(e) => setEpilogue(e.target.value)}
                />
                <FormHelperText></FormHelperText>
              </FormControl>
              <div class="up-10px uborder-dashed uborder-1px uw-full">
                <Button onClick={() => addQuestionAtIndex(0)}>
                  Add question
                </Button>
                <For each={questions()}>
                  {(item, idx) => {
                    const UI = item.UI;
                    return (
                      <div class="umt-10px">
                        <Divider class="umy-10px" />
                        <UI />
                        <Button
                          colorScheme={"danger"}
                          onClick={() =>
                            setQuestions((current) =>
                              current.filter(
                                (x) =>
                                  x.current.internalId !==
                                  item.current.internalId
                              )
                            )
                          }
                        >
                          Delete
                        </Button>
                        <Divider class="umy-10px" />
                        <Button onClick={() => addQuestionAtIndex(idx() + 1)}>
                          Add question
                        </Button>
                      </div>
                    );
                  }}
                </For>

                <Divider class="umy-10px" />
                <HStack spacing={"10px"}>
                  <Button
                    onClick={async () => {
                      const file = await openAFile();
                      if (file != null) {
                        const content = JSON.parse(file);
                        if ("questions" in content) {
                          setQuestions(
                            content["questions"].map(createQuestionState)
                          );
                        }
                        if ("presetId" in content) {
                          setPresetId(String(content["presetId"]));
                        }
                        if ("prologue" in content) {
                          setPrologue(String(content["prologue"]));
                        }
                        if ("epilogue" in content) {
                          setEpilogue(String(content["epilogue"]));
                        }
                      }
                    }}
                  >
                    Load preset
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob(
                        [
                          JSON.stringify({
                            presetId: presetId(),
                            questions: questions().map((x) => x.current),
                            prologue: prologue(),
                            epilogue: epilogue(),
                          }),
                        ],
                        { type: "text/plain;charset=utf-8" }
                      );
                      saveAs(blob, `${safeFileName(presetId())}.json`);
                    }}
                  >
                    Save preset
                  </Button>
                  <Button
                    onClick={async () => {
                      const file = await openAFile();
                      if (file != null) {
                        const content = JSON.parse(file);
                        if ("questions" in content) {
                          setQuestions((x) => [
                            ...x,
                            ...content["questions"].map(createQuestionState),
                          ]);
                        }
                      }
                    }}
                  >
                    Merge preset
                  </Button>
                </HStack>
              </div>
              <Button
                onClick={() => {
                  console.log(questions().map((x) => x.current));
                  onClose();
                  startRoutine();
                }}
              >
                Start!
              </Button>
            </VStack>
          </ModalBody>
          {/* <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </HopeProvider>
  );
}

if ("destroyCurrent" in window) {
  // @ts-ignore
  window["destroyCurrent"]!();
}

const nav = document.querySelector(`a[href="/gpts"]`)!.parentElement!;
// const div = (<a class="flex h-10 w-full items-center gap-2 rounded-lg px-2 font-semibold text-token-text-primary hover:bg-token-surface-primary"></a>) as HTMLDivElement;
const newTab = document.querySelector(`a[href="/"]`)! as HTMLLinkElement;
// nav.insertBefore(div, nav.firstChild);
console.log(newTab);

const unmount = render(() => <App />, nav);

// @ts-ignore
window["destroyCurrent"] = () => {
  unmount();
  // div.remove();
};
