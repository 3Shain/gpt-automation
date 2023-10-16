import { render } from "solid-js/web";
import { Divider, HopeProvider, createDisclosure } from "@hope-ui/solid";
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
import { For, JSX, createSignal } from "solid-js";
import { generateReport } from "./generate_report";

interface GptResponse {
  plainText: string;
  rawHTML: string;
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
    function check() {
      if (responseStarted) {
        if (
          document
            .querySelector(".final-completion")
            ?.querySelector(".result-streaming") === null
        ) {
          const final = document
            .querySelector(".final-completion")
            ?.querySelector(".markdown.prose");
          if (final) {
            res(final as HTMLElement);
          } else {
            rej(new Error("Detect response failed"));
          }
          return;
        }
      } else {
        if (
          document
            .querySelector(".final-completion")
            ?.querySelector(".result-streaming")
        ) {
          responseStarted = true;
        }
      }
      requestAnimationFrame(check);
    }
    check();
  });
}

async function postMessage(content: string) {
  textarea = document.querySelector(
    '#prompt-textarea[tabindex="0"]'
  ) as HTMLTextAreaElement;
  submitButton = textarea.nextElementSibling as HTMLButtonElement;
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
    body: string;
    answerHTML: string;
  }[] = [];
  let lastContext :any = null;
  for (const q of questions()) {
    if(lastContext!=q.current.contextId) {
      console.log("context id differ");
      newTab.click();
      await wait(1000);
    }
    await postMessage(q.current.body);
    const response = await waitUntilResponse();
    // console.log(response);
    data.push({
      ...q.current,
      answerHTML: response.outerHTML,
    });
    await wait(5000);
    lastContext = q.current.contextId;
  }
  console.log("Done!");
  const blob = new Blob([generateReport(data)], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `report_${new Date().toLocaleString()}.html`);
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
    UI: () => (
      <>
        <FormControl required>
          <FormLabel for="qid">Question Id</FormLabel>
          <Input id="qid" value={id()} onInput={(e) => setId(e.target.value)} />
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
        </FormControl>
      </>
    ),
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
        class="flex px-3 min-h-[44px] py-1 items-center gap-3 transition-colors duration-200 dark:text-white cursor-pointer text-sm rounded-md border dark:border-white/20 gizmo:min-h-0 hover:bg-gray-500/10 h-11 gizmo:h-10 gizmo:rounded-lg gizmo:border-[rgba(0,0,0,0.1)] bg-white dark:bg-transparent flex-grow overflow-hidden"
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
            {/* <Textarea
              value={value()}
              onInput={handleInput}
              placeholder="Paste questions here. Each line with one question."
            /> */}
            <div class="up-10px uborder-dashed uborder-1px">
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
                                x.current.internalId !== item.current.internalId
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
                        questions: questions().map((x) => x.current),
                      }),
                    ],
                    { type: "text/plain;charset=utf-8" }
                  );
                  saveAs(blob, "preset.json");
                }}
              >
                Save preset
              </Button>
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
          </ModalBody>
          {/* <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </HopeProvider>
  );
}

const nav = document.querySelector("nav")!;
const div = (<div class="mb-1 flex flex-row gap-2"></div>) as HTMLDivElement;
const newTab = nav.firstChild!.firstChild as HTMLLinkElement;
nav.insertBefore(div, nav.firstChild);

render(() => <App />, div);
