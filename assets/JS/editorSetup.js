import { EditorState, basicSetup, EditorView } from "../../node_modules/@codemirror/basic-setup/dist/index.js";
import { keymap } from "../../node_modules/@codemirror/view/dist/index";
import { defaultTabBinding } from "../../node_modules/@codemirror/commands/dist/index";
import { json } from "../../node_modules/@codemirror/lang-json/dist/index";

export default function editorSetup() {
    const jsonRequestBody = document.querySelector('[data-json-request-body]');
    const jsonResponseBody = document.querySelector('[data-json-response-body]');

    const basicExtensions = [
        basicSetup,
        keymap.of([defaultTabBinding]),
        json(),
        EditorState.tabSize.of(2)
    ];

    const requestEditor = new EditorView({
        state: EditorState.create({
            doc: "{}",
            extensions: basicExtensions,
        }),
        parent: jsonRequestBody,
    });

    const responseEditor = new EditorView({
        state: EditorState.create({
            doc: "{\n\t\n}",
            extensions: [...basicExtensions, EditorView.editable.of(false)],
        }),
        parent: jsonResponseBody,
    });

    function updateResponseEditor(value) {
        responseEditor.dispatch({
            changes: {
                from: 0,
                to: responseEditor.state.doc.length,
                insert: JSON.stringify(value, null, 2),
            },
        });
    }

    return { requestEditor, updateResponseEditor }
}
