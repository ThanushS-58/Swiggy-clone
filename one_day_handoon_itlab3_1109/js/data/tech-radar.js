/**
 * SkillForge Pro - 2025/2026 Tech Radar for Senior Tech Professionals
 * Modeled after enterprise engineering radar: ADOPT, TRIAL, ASSESS, HOLD.
 */

window.SKILLFORGE_TECH_RADAR = {
  lastUpdated: "Q1 2026",
  rings: ["ADOPT", "TRIAL", "ASSESS", "HOLD"],
  items: [
    {
      name: "LangGraph / State Machines",
      category: "AI & ML",
      ring: "ADOPT",
      description: "Moving from naive autonomous loops to deterministic, state-persisted agentic graphs with human-in-the-loop checkpoints.",
      linkCourseId: "genai-rag-architect"
    },
    {
      name: "vLLM & PagedAttention",
      category: "AI & ML",
      ring: "ADOPT",
      description: "Standard for high-throughput self-hosted open-weights LLM inference. Massive reduction in KV-cache fragmentation.",
      linkCourseId: "genai-rag-architect"
    },
    {
      name: "eBPF & Cilium",
      category: "DevOps & Cloud",
      ring: "ADOPT",
      description: "Replaces legacy iptables/IPVS in Kubernetes. Kernel-level observability, L7 routing, and transparent encryption.",
      linkCourseId: "cloud-native-k8s"
    },
    {
      name: "ArgoCD & GitOps",
      category: "DevOps & Cloud",
      ring: "ADOPT",
      description: "Declarative, automated continuous delivery for Kubernetes with automatic self-healing and drift remediation.",
      linkCourseId: "cloud-native-k8s"
    },
    {
      name: "Sigstore & Keyless Cosign",
      category: "Security",
      ring: "ADOPT",
      description: "Eliminates private key management by using short-lived OIDC-backed signing tokens for container supply chain integrity.",
      linkCourseId: "devsecops-zerotrust"
    },
    {
      name: "Small Language Models (SLMs) on Edge",
      category: "AI & ML",
      ring: "TRIAL",
      description: "Models like Phi-4 and Gemma-2 9B providing sub-second latency and privacy-preserving inference on client hardware.",
      linkCourseId: "genai-rag-architect"
    },
    {
      name: "WebAssembly (Wasm) in Cloud Native",
      category: "Platforms",
      ring: "TRIAL",
      description: "Running Wasm micro-runtimes (Wasmtime, Spin) side-by-side with Kubernetes pods for ultra-low cold start times.",
      linkCourseId: "cloud-native-k8s"
    },
    {
      name: "Kafka KIP-429 Cooperative Rebalance",
      category: "Architecture",
      ring: "ADOPT",
      description: "Non-disruptive, incremental consumer group rebalancing that eliminates stop-the-world stream processing pauses.",
      linkCourseId: "high-scale-system-design"
    },
    {
      name: "DeepSeek / Reasoning LLMs with R1-Style Trees",
      category: "AI & ML",
      ring: "TRIAL",
      description: "Test-time compute scaling and chain-of-thought verification for complex programming and mathematics workflows.",
      linkCourseId: "genai-rag-architect"
    },
    {
      name: "Blind Blue/Green Deployments",
      category: "DevOps",
      ring: "HOLD",
      description: "Switching 100% traffic without metric-driven canary verification frequently leads to catastrophic instant blast radius.",
      linkCourseId: "cloud-native-k8s"
    },
    {
      name: "Long-Lived IAM Keys in CI/CD",
      category: "Security",
      ring: "HOLD",
      description: "High risk of leakage and lateral movement. Adopt OpenID Connect (OIDC) federation with ephemeral STS tokens instead.",
      linkCourseId: "devsecops-zerotrust"
    },
    {
      name: "Unbounded Vector Search without BM25",
      category: "AI & ML",
      ring: "HOLD",
      description: "Naive vector retrieval drops precise keyword recall (SKUs, IDs, method names). Modern systems mandate Hybrid Search.",
      linkCourseId: "genai-rag-architect"
    }
  ]
};
