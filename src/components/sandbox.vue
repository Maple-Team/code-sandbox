<template>
  <div class="cb-container">
    <div class="cb-editor">
      <TextArea :codeObj="codeMap['/src/index.jsx']"></TextArea>
      <TextArea :codeObj="codeMap['/src/App.jsx']"></TextArea>
      <TextArea :codeObj="codeMap['/src/data.json']"></TextArea>
      <TextArea :codeObj="codeMap['/src/App.css']"></TextArea>
    </div>
    <div class="cb-preview">
      <iframe
        id="sandbox"
        @load="noticeSandboxUpdate"
        src="/sandbox.html"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import TextArea from "./textarea2.vue";

export default defineComponent({
  components: { TextArea },
  setup() {
    return {};
  },
  data() {
    return {
      codeMap: {
        "/src/index.jsx": {
          code: `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`.trim(),
          path: "/src/index.jsx",
        },
        "/src/App.jsx": {
          code: `
import React, { useState } from 'react'
import { title } from './data.json'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="App">
      <header className="App-header">
        <p>Hello {title}!</p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </p>
      </header>
    </div>
  )
}
`.trim(),
          path: "/src/App.jsx",
        },
        "/src/data.json": {
          code: `{ "title": "Mini Sandbox - Json Data" }`,
          path: "/src/data.json",
        },
        "/src/App.css": {
          code: `
body {
  padding: 0;
  margin: 0;
}
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

button {
  font-size: calc(10px + 2vmin);
}
`.trim(),
          path: `/src/App.css`,
        },
      },
    };
  },
  methods: {
    noticeSandboxUpdate() {
      const sandbox = document.querySelector("#sandbox");
      if (sandbox) {
        (sandbox as HTMLIFrameElement).contentWindow?.postMessage({
          codeMap: JSON.parse(JSON.stringify(this.codeMap)),
          entry: "/src/index.jsx",
          dependencies: {},
          externals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        });
      }
    },
  },
});
</script>

<style lang="less">
@radius: 5px;
.cb-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
  flex: 1;
  overflow-y: auto;
  width: 100%;
  padding-left: 10px;
  .cb-editor {
    border: 1px solid #eee;
    border-radius: @radius;
    padding: 10px;
  }
  .cb-preview {
    border-top-left-radius: @radius;
    border-bottom-left-radius: @radius;
    background: #0b0e11;
    padding: 10px;
    #sandbox {
      width: 100%;
      height: 100%;
      // background: #fff;
    }
  }
}
</style>
