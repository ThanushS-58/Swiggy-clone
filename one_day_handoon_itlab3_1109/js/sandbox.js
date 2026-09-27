/**
 * SkillForge Pro - Interactive Cloud & AI Sandbox Simulator
 * Provides an authentic client-side bash/CLI simulator for Kubernetes, Docker, Python RAG, and Security tools.
 */

const SkillForgeSandbox = {
  terminalOutput: null,
  terminalInput: null,
  history: [],
  historyIndex: -1,

  virtualFileSystem: {
    "payment-service.yaml": "apiVersion: apps/v1\nkind: Deployment...",
    "hybrid_retriever.py": "import numpy as np\n# Production RAG hybrid search",
    "cosign_policy.yaml": "apiVersion: kyverno.io/v1\nkind: ClusterPolicy..."
  },

  commands: {
    help(args) {
      return `
<span class="terminal-info font-bold">SkillForge Pro - Simulated Cloud & AI Terminal v2.6.0</span>
Available simulated commands:
  <span class="terminal-prompt">kubectl</span> get pods | describe pod | get nodes | scale &lt;name&gt;
  <span class="terminal-prompt">docker</span> ps | images | compose up -d | logs &lt;container&gt;
  <span class="terminal-prompt">python</span> rag_demo.py | langgraph_flow.py | eval.py
  <span class="terminal-prompt">curl</span> http://localhost:8000/v1/chat/completions
  <span class="terminal-prompt">cosign</span> verify | sign &lt;image&gt;
  <span class="terminal-prompt">trivy</span> image &lt;target&gt;
  <span class="terminal-prompt">ls</span>, <span class="terminal-prompt">cat &lt;file&gt;</span>, <span class="terminal-prompt">clear</span>, <span class="terminal-prompt">uname -a</span>
      `;
    },

    clear() {
      if (SkillForgeSandbox.terminalOutput) {
        SkillForgeSandbox.terminalOutput.innerHTML = "";
      }
      return null;
    },

    "uname"(args) {
      return `Linux skillforge-cloud-node-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`;
    },

    ls() {
      return `<span class="text-cyan-400">payment-service.yaml</span>   <span class="text-emerald-400">hybrid_retriever.py</span>   <span class="text-indigo-400">cosign_policy.yaml</span>   <span class="text-yellow-400">docker-compose.yml</span>`;
    },

    cat(args) {
      const file = args[0];
      if (!file) return `<span class="terminal-error">Usage: cat &lt;filename&gt;</span>`;
      if (file === "payment-service.yaml") {
        return `<pre class="text-slate-300">apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: payment-service\nspec:\n  replicas: 6\n  topologySpreadConstraints:\n  - maxSkew: 1\n    topologyKey: topology.kubernetes.io/zone</pre>`;
      }
      if (file === "hybrid_retriever.py") {
        return `<pre class="text-slate-300"># Production Reciprocal Rank Fusion (RRF)\ndef rrf(dense_ranks, sparse_ranks, k=60):\n    return sum(1.0 / (k + rank))</pre>`;
      }
      return `<span class="terminal-error">cat: ${file}: No such file or directory</span>`;
    },

    docker(args) {
      const sub = args[0];
      if (!sub || sub === "ps") {
        return `
CONTAINER ID   IMAGE                                COMMAND                  CREATED         STATUS         PORTS                    NAMES
a8f9c12b7e41   qdrant/qdrant:v1.11.0                "./qdrant"               2 hours ago     Up 2 hours     0.0.0.0:6333->6333/tcp   qdrant-vector-db
b3e410a99c82   vllm/vllm-openai:v0.6.1              "python3 -m vllm.ent…"   4 hours ago     Up 4 hours     0.0.0.0:8000->8000/tcp   vllm-deepseek-coder
d512a809f6e3   redis:7.4-alpine                     "docker-entrypoint.s…"   2 days ago      Up 2 days      0.0.0.0:6379->6379/tcp   redis-cache-cluster
        `;
      }
      if (sub === "images") {
        return `
REPOSITORY                  TAG       IMAGE ID       CREATED         SIZE
qdrant/qdrant               v1.11.0   9a823b11e2f1   2 weeks ago     142MB
vllm/vllm-openai            v0.6.1    41b80ce27d04   3 days ago      8.4GB
payment-service             v2.4.0    c88102f9a01e   1 hour ago      210MB
        `;
      }
      if (sub === "compose" && args[1] === "up") {
        return `
<span class="terminal-info">[+] Running 3/3</span>
 <span class="terminal-success">✔ Container redis-cache-cluster   Started</span>
 <span class="terminal-success">✔ Container qdrant-vector-db     Started</span>
 <span class="terminal-success">✔ Container vllm-deepseek-coder  Started</span>
<span class="terminal-success">✔ Cluster stack is healthy and bound to 0.0.0.0:8000</span>
        `;
      }
      return `<span class="terminal-info">Simulated docker command: docker ${args.join(" ")}</span>`;
    },

    kubectl(args) {
      const sub = args[0];
      if (sub === "get" && args[1] === "pods") {
        return `
NAME                               READY   STATUS    RESTARTS   AGE    IP             NODE
payment-service-78bf597c4d-2k8xf   1/1     Running   0          18m    10.244.1.42    k8s-worker-us-east-1a
payment-service-78bf597c4d-9ml0q   1/1     Running   0          18m    10.244.2.19    k8s-worker-us-east-1b
payment-service-78bf597c4d-x7pl2   1/1     Running   0          18m    10.244.3.88    k8s-worker-us-east-1c
rag-inference-worker-5d8f967-8pl   2/2     Running   0          4h     10.244.1.77    k8s-worker-us-east-1a
cilium-operator-6d8b7cfd54-zkmqw   1/1     Running   0          3d     10.244.0.12    k8s-control-plane-01
        `;
      }
      if (sub === "get" && args[1] === "nodes") {
        return `
NAME                    STATUS   ROLES           AGE   VERSION   ZONE
k8s-control-plane-01    Ready    control-plane   14d   v1.31.1   us-east-1a
k8s-worker-us-east-1a   Ready    &lt;none&gt;          14d   v1.31.1   us-east-1a
k8s-worker-us-east-1b   Ready    &lt;none&gt;          14d   v1.31.1   us-east-1b
k8s-worker-us-east-1c   Ready    &lt;none&gt;          14d   v1.31.1   us-east-1c
        `;
      }
      if (sub === "scale") {
        return `<span class="terminal-success">deployment.apps/payment-service scaled to 6 replicas (Balanced across 3 AZs via TopologySpreadConstraints)</span>`;
      }
      return `<span class="terminal-info">kubectl output: Command executed successfully in default namespace.</span>`;
    },

    python(args) {
      const script = args[0] || "";
      if (script.includes("rag") || script.includes("hybrid")) {
        return `
<span class="terminal-info">[INFO] Initializing FastEmbed dense model (bge-large-en-v1.5)...</span>
<span class="terminal-info">[INFO] Loading BM25 sparse index (14,200 indexed enterprise docs)...</span>
<span class="terminal-prompt">&gt; Query: "How to handle cache stampede in Kafka consumers?"</span>
----------------------------------------------------------------------
1. [Dense Score: 0.892 | BM25: 18.42] -> <span class="terminal-success">RRF Combined: 0.0328</span>
   <span class="text-white font-semibold">Doc #402: Probabilistic Early Expiration (XFetch algorithm) in Distributed Caching</span>
2. [Dense Score: 0.871 | BM25: 14.10] -> <span class="terminal-success">RRF Combined: 0.0294</span>
   <span class="text-white font-semibold">Doc #118: CooperativeStickyAssignor in KIP-429 to avoid rebalance storms</span>
----------------------------------------------------------------------
<span class="terminal-success">✔ Retrieval completed in 42ms. Passed 2 chunks to LLM Context Window.</span>
        `;
      }
      if (script.includes("langgraph") || script.includes("agent")) {
        return `
<span class="terminal-info">[LangGraph] Compiling StateGraph(AgentState)...</span>
<span class="terminal-info">[Step 1: Router]</span> Evaluating input: "Deploy updated canary image to production"
<span class="terminal-warn">[Checkpoint] Node flagged as high-risk operation (Production Deployment).</span>
<span class="terminal-info">[Pause] Waiting for human approval signal...</span>
<span class="terminal-success">[Approval] Verified signature via Cosign OIDC identity (devops-lead@company.com).</span>
<span class="terminal-success">✔ Node resumed: Executing safe canary shift (weight: 10%).</span>
        `;
      }
      return `<span class="terminal-info">Python 3.12.5 (main, Aug 2026) [GCC 13.2.0 on linux]</span>\nExecuted script successfully.`;
    },

    curl(args) {
      return `
HTTP/1.1 200 OK
content-type: application/json
x-inference-engine: vLLM-PagedAttention
x-tokens-per-second: 114.8

{
  "id": "chatcmpl-920ab81",
  "object": "chat.completion",
  "model": "Qwen2.5-Coder-32B-Instruct",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "To prevent cache stampede in high-concurrency systems, utilize the XFetch probabilistic early expiration formula: delta * beta * ln(random). This guarantees background computation before key TTL expiry."
    },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 142, "completion_tokens": 58, "total_tokens": 200 }
}
      `;
    },

    cosign(args) {
      return `
<span class="terminal-info">[Cosign] Verifying signature against Rekor transparency ledger...</span>
Verification for: <span class="terminal-info">ghcr.io/enterprise/payment-service@sha256:49c12a...</span>
Certificate Issuer: https://token.actions.githubusercontent.com
Signer Identity: https://github.com/enterprise/payment-service/.github/workflows/deploy.yml@refs/heads/main
<span class="terminal-success">✔ The following checks were performed and each one passed:</span>
  - The cosign claims were validated
  - The claims were present in the transparency log
  - The signatures were verified against the specified certificate
      `;
    },

    trivy(args) {
      return `
<span class="terminal-info">trivy image payment-service:v2.4.0</span>
2026-09-11T09:45:10Z [INFO] Need to update DB
2026-09-11T09:45:12Z [INFO] Vulnerability database updated

payment-service:v2.4.0 (debian 12.6)
=====================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)
<span class="terminal-success">✔ Zero critical or high vulnerabilities detected. SBOM validated.</span>
      `;
    }
  },

  init(outputElementId, inputElementId) {
    this.terminalOutput = document.getElementById(outputElementId);
    this.terminalInput = document.getElementById(inputElementId);

    if (!this.terminalInput || !this.terminalOutput) return;

    // Initial greeting
    this.terminalOutput.innerHTML = `
      <div class="text-slate-400 mb-2">SkillForge Pro Sandbox Environment [Ubuntu 24.04 LTS / x86_64]</div>
      <div class="text-slate-500 mb-3">Type <span class="text-indigo-400 font-semibold">'help'</span> to see simulated commands, or click any preloaded lab below.</div>
    `;

    this.terminalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const raw = this.terminalInput.value.trim();
        if (raw) {
          this.execute(raw);
          this.history.push(raw);
          this.historyIndex = this.history.length;
          this.terminalInput.value = "";
        }
      } else if (e.key === "ArrowUp") {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.terminalInput.value = this.history[this.historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.terminalInput.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.terminalInput.value = "";
        }
      }
    });
  },

  execute(commandLine) {
    if (!this.terminalOutput) return;

    // Append prompt
    const promptEntry = document.createElement("div");
    promptEntry.className = "mt-2";
    promptEntry.innerHTML = `<span class="terminal-prompt">engineer@skillforge-cloud:~$</span> <span class="text-white">${this.escapeHtml(commandLine)}</span>`;
    this.terminalOutput.appendChild(promptEntry);

    const parts = commandLine.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputHtml = "";
    if (this.commands[cmd]) {
      outputHtml = this.commands[cmd](args);
    } else {
      outputHtml = `<span class="terminal-error">command not found: ${this.escapeHtml(cmd)}. Type 'help' for available commands.</span>`;
    }

    if (outputHtml) {
      const resultEntry = document.createElement("div");
      resultEntry.className = "mt-1 whitespace-pre-wrap";
      resultEntry.innerHTML = outputHtml;
      this.terminalOutput.appendChild(resultEntry);
    }

    // Auto-scroll to bottom
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  },

  runPreset(commandString) {
    if (this.terminalInput) {
      this.terminalInput.value = commandString;
      this.execute(commandString);
      this.history.push(commandString);
      this.historyIndex = this.history.length;
      this.terminalInput.value = "";
    }
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

window.SkillForgeSandbox = SkillForgeSandbox;
