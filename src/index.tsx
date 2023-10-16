import { render } from "solid-js/web";
import { HopeProvider, createDisclosure } from "@hope-ui/solid";
import { Button } from "@hope-ui/solid";
import { Textarea } from "@hope-ui/solid";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@hope-ui/solid";
import { saveAs } from "file-saver";
import "virtual:uno.css";
import { createSignal } from "solid-js";

interface GptResponse {
  plainText: string;
  rawHTML: string;
}

let textarea: HTMLTextAreaElement;
let submitButton: HTMLButtonElement;

function wait(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}

function waitUntilResponse(): Promise<string> {
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
            res(final.textContent!);
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

async function startRoutine(questions: string[]) {
  for (const q of questions) {
    await postMessage(q);
    const response = await waitUntilResponse();
    console.log(response);
  }
  console.log("Done!");
}

function App() {
  textarea = document.querySelector(
    '#prompt-textarea[tabindex="0"]'
  ) as HTMLTextAreaElement;
  submitButton = textarea.nextElementSibling as HTMLButtonElement;

  //   setTimeout(() => {
  //     postMessage("Tell me something intersting.");
  //   });

  const { isOpen, onOpen, onClose } = createDisclosure();
  const [value, setValue] = createSignal("");
  const handleInput = (event: { target: { value: any } }) =>
    setValue(event.target.value);

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
            <Textarea
              value={value()}
              onInput={handleInput}
              placeholder="Paste questions here. Each line with one question."
            />
            <Button
              onClick={() => {
                onClose();
                startRoutine(value().split(/\r?\n/));
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
nav.insertBefore(div, nav.firstChild);

render(() => <App />, div);
