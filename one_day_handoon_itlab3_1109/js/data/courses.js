/**
 * SkillForge Pro - Curated Curriculum Data for Working Professionals
 * High-impact, production-grade tracks covering cutting-edge 2025/2026 tech stacks.
 */

window.SKILLFORGE_COURSES = [
  {
    id: "genai-rag-architect",
    title: "Production RAG & Multi-Agent AI Systems",
    subtitle: "Architect enterprise-grade Retrieval Augmented Generation, agentic workflows with LangGraph, and sub-second hybrid vector search.",
    category: "AI & Machine Learning",
    badge: "Hot • 2026 Track",
    level: "Staff / Senior",
    estHours: "4.5 hrs",
    lessonsCount: 4,
    tags: ["GenAI", "LangGraph", "Vector DBs", "RAG", "Python"],
    color: "from-blue-500 to-indigo-600",
    icon: "sparkles",
    overview: "Designed for senior software engineers and architects transitioning into AI Engineering. Move past toy prompts to build resilient, evaluated, and production-ready Retrieval Augmented Generation (RAG) pipelines and stateful autonomous agents.",
    prerequisites: "Familiarity with Python or TypeScript, basic REST APIs, and familiarity with LLM APIs (OpenAI / Anthropic / Local vLLM).",
    lessons: [
      {
        id: "rag-01-hybrid-retrieval",
        title: "Hybrid Search: Combining BM25 & Dense Vector Embeddings",
        readTime: "12 min",
        summary: {
          keyTakeaway: "Pure semantic vector search fails on acronyms, product SKUs, and exact code symbols. Production systems require Hybrid Retrieval with Reciprocal Rank Fusion (RRF).",
          architectureNotes: "Client -> Hybrid Engine -> Parallel Search [Dense Embeddings (e.g., BAAI/bge-large) + BM25 Sparse Index] -> Reciprocal Rank Fusion (RRF) -> Cross-Encoder Reranker (Cohere / BGE-Reranker) -> Top-K context to LLM.",
          antiPatterns: "Using pure cosine similarity on short queries or assuming high embedding similarity equals factual relevance."
        },
        deepDive: {
          concept: "Hybrid Search leverages the complementary strengths of lexical search (BM25 or SPLADE for exact token matches) and semantic vector search (bi-encoders for conceptual context). By combining scores using Reciprocal Rank Fusion (RRF), you eliminate false positives and catch exact IDs while preserving contextual recall.",
          codeTitle: "production_hybrid_retriever.py",
          codeLang: "python",
          code: `import numpy as np
from typing import List, Dict

def reciprocal_rank_fusion(dense_results: List[Dict], sparse_results: List[Dict], k: int = 60) -> List[Dict]:
    """
    RRF algorithm combining dense (vector) and sparse (BM25) ranking lists.
    Formula: RRF_Score = SUM( 1 / (k + rank_i) )
    """
    scores = {}
    doc_map = {}

    # Rank dense results
    for rank, item in enumerate(dense_results, 1):
        doc_id = item["id"]
        doc_map[doc_id] = item
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    # Rank sparse results
    for rank, item in enumerate(sparse_results, 1):
        doc_id = item["id"]
        doc_map[doc_id] = item
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    # Sort merged documents descending by score
    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [{"doc": doc_map[doc_id], "rrf_score": score} for doc_id, score in sorted_docs]

# Example production pipeline execution
dense_matches = [{"id": "doc_42", "text": "Kubernetes Pod autoscaling metrics using HPA", "score": 0.89}]
sparse_matches = [{"id": "doc_42", "text": "Kubernetes Pod autoscaling metrics using HPA", "score": 14.2}]
ranked = reciprocal_rank_fusion(dense_matches, sparse_matches)
print(f"Top Document: {ranked[0]['doc']['id']} with RRF Score {ranked[0]['rrf_score']:.4f}")`,
          troubleshooting: "If latency exceeds 150ms, run BM25 and dense vector queries concurrently using asyncio.gather or thread pool, and prune candidate sets to top 50 before running cross-encoder reranking."
        },
        quiz: {
          question: "Why is pure dense vector search often insufficient for enterprise technical documentation search?",
          options: [
            "Dense vector search cannot handle text longer than 20 characters.",
            "Dense vectors smooth out distinct exact-match tokens like error codes, API function names, and part numbers.",
            "Vector databases do not support indexing algorithms like HNSW.",
            "LLMs cannot parse vector search results without JSON formatting."
          ],
          correctIndex: 1,
          explanation: "Dense embeddings represent semantic gist. Specific keywords like 'CVE-2024-3094' or exact API function names 'kubectl_apply_v1' have their unique tokens diluted in a high-dimensional vector space. Hybrid search with BM25 guarantees exact match recall."
        }
      },
      {
        id: "rag-02-langgraph-agents",
        title: "Stateful Agentic Workflows with LangGraph",
        readTime: "15 min",
        summary: {
          keyTakeaway: "Static DAGs and naive ReAct loops get stuck in infinite loops. LangGraph uses state machines with cyclic graphs, checkpointing, and human-in-the-loop validation.",
          architectureNotes: "State Graph: [Input] -> [Router Node] -> Conditional Edge -> (Retrieval Tool | Web Search Tool | SQL Agent) -> [Synthesizer Node] -> [Guardrail / Human Approval] -> [Output]",
          antiPatterns: "Unbounded autonomous tool calling without max recursion depth limits or state rollback checkpoints."
        },
        deepDive: {
          concept: "LangGraph builds on top of state machines. Unlike traditional linear LLM chains, multi-agent systems require cyclical coordination, state schema persistence, and the ability to roll back when an agent hits a dead end.",
          codeTitle: "langgraph_agentic_flow.py",
          codeLang: "python",
          code: `from typing import TypedDict, Annotated, Sequence
import operator

# 1. Define Typed State
class AgentState(TypedDict):
    messages: Annotated[Sequence[str], operator.add]
    requires_approval: bool
    current_plan: str
    retry_count: int

# 2. Node definitions
def analyze_request_node(state: AgentState) -> dict:
    prompt = state["messages"][-1]
    # Evaluate if destructive action is requested
    is_risky = "delete" in prompt.lower() or "drop table" in prompt.lower()
    return {
        "messages": [f"Evaluated request. Risky={is_risky}"],
        "requires_approval": is_risky,
        "retry_count": state.get("retry_count", 0) + 1
    }

def router_condition(state: AgentState) -> str:
    if state["requires_approval"]:
        return "human_approval_checkpoint"
    return "execute_safe_action"

print("LangGraph State Machine Schema initialized with conditional branching.")`,
          troubleshooting: "Always persist state in an external store (like Postgres or Redis Checkpointer) so that paused agent execution resumes seamlessly across microservice restarts."
        },
        quiz: {
          question: "What is the primary architectural benefit of LangGraph over traditional linear RAG chains?",
          options: [
            "It eliminates the need for vector embeddings.",
            "It provides cyclical graph state persistence, conditional branching, and human-in-the-loop checkpoints.",
            "It runs LLMs locally on client browsers without WebAssembly.",
            "It replaces Docker containers with serverless functions."
          ],
          correctIndex: 1,
          explanation: "LangGraph models workflows as state graphs where agents can cycle back, retry steps based on self-reflection, pause for human approval, and maintain persisted state."
        }
      },
      {
        id: "rag-03-chunking-evals",
        title: "Semantic Chunking & Automated Evaluation (Ragas / TruLens)",
        readTime: "14 min",
        summary: {
          keyTakeaway: "Fixed-size chunking splits critical context across boundaries. Context-aware semantic chunking combined with synthetic evaluation (Faithfulness, Answer Relevance) is mandatory before deploying to production.",
          architectureNotes: "Ingestion -> Semantic Boundary Detector -> Markdown/Header Aware Chunker -> Vector Store. Evaluation Loop: Ground Truth synthetic generation -> Ragas Metric Triad (Faithfulness, Context Precision, Answer Relevance).",
          antiPatterns: "Splitting strictly on 500 characters with 50 character overlap without respecting markdown headers or code block closures."
        },
        deepDive: {
          concept: "Semantic chunking detects shifts in cosine similarity between adjacent sentences to split documents at natural topical transitions. Automated evaluation using LLM-as-a-judge provides quantifiable confidence scores across releases.",
          codeTitle: "semantic_chunker_eval.py",
          codeLang: "python",
          code: `def calculate_faithfulness(answer: str, retrieved_contexts: list[str]) -> float:
    """
    Evaluates if claims in the LLM answer are strictly grounded in retrieved context.
    Metric returns a 0.0 to 1.0 confidence score.
    """
    # Production implementations use Ragas or TruLens with structured JSON schema outputs
    print(f"Verifying {len(retrieved_contexts)} context passages against synthesized response.")
    return 0.94 # Sample high-fidelity confidence score`,
          troubleshooting: "When testing RAG evaluation suites in CI/CD, run evaluations against cached embeddings to avoid incurring unnecessary LLM API costs."
        },
        quiz: {
          question: "Which of the following is considered the 'RAG Triad' of metrics for production evaluation?",
          options: [
            "CPU usage, Memory utilization, Network latency",
            "Context Relevance, Groundedness (Faithfulness), and Answer Relevance",
            "Token length, Font size, DOM load time",
            "SSL expiry, DNS resolution, HTTP 200 rate"
          ],
          correctIndex: 1,
          explanation: "The RAG Triad evaluates the 3 critical stages: Is retrieved context relevant? Is the generated answer grounded in the retrieved context? Does the answer directly solve the user query?"
        }
      },
      {
        id: "rag-04-vllm-deployment",
        title: "Deploying Open-Weights LLMs with vLLM & PagedAttention",
        readTime: "16 min",
        summary: {
          keyTakeaway: "Standard PyTorch inference wastes 60-80% of GPU memory in KV-cache fragmentation. vLLM with PagedAttention enables 5-10x higher throughput for enterprise self-hosted models.",
          architectureNotes: "Incoming HTTP Batch -> Continuous Batching Engine -> PagedAttention Virtual Memory Manager -> CUDA Kernels (Tensor Parallelism across GPUs) -> Streaming SSE Response.",
          antiPatterns: "Using standard Flask/FastAPI wrappers around Hugging Face pipelines for high-concurrency production serving."
        },
        deepDive: {
          concept: "PagedAttention is inspired by OS virtual memory paging. It stores keys and values in non-contiguous physical GPU memory blocks, eliminating internal fragmentation and enabling concurrent request sharing for system prompts.",
          codeTitle: "vllm_cluster_serve.sh",
          codeLang: "bash",
          code: `#!/usr/bin/env bash
# Production vLLM startup with Tensor Parallelism across 2 GPUs
python3 -m vllm.entrypoints.openai.api_server \\
    --model Qwen/Qwen2.5-Coder-32B-Instruct \\
    --tensor-parallel-size 2 \\
    --gpu-memory-utilization 0.92 \\
    --max-model-len 32768 \\
    --enable-prefix-caching \\
    --port 8000`,
          troubleshooting: "Enabling '--enable-prefix-caching' dramatically speeds up multi-turn conversations and agentic loops by reusing the KV cache for the recurring system prompt."
        },
        quiz: {
          question: "What primary bottleneck does PagedAttention solve in large language model inference?",
          options: [
            "It translates Python code directly to C++ binaries.",
            "It solves GPU KV-cache memory fragmentation and enables dynamic memory allocation without pre-allocation waste.",
            "It converts floating-point numbers into 4-bit integers.",
            "It replaces TCP/IP with UDP for faster responses."
          ],
          correctIndex: 1,
          explanation: "KV-cache in traditional transformer inference suffered up to 80% memory waste due to static allocation and memory fragmentation. PagedAttention organizes KV memory in non-contiguous virtual pages."
        }
      }
    ]
  },
  {
    id: "cloud-native-k8s",
    title: "Kubernetes Platform Engineering & GitOps",
    subtitle: "Master multi-cluster Kubernetes, ArgoCD GitOps pipelines, eBPF Cilium networking, and zero-downtime Canary deployments.",
    category: "DevOps & Cloud Native",
    badge: "Enterprise Standard",
    level: "Staff / Senior",
    estHours: "5.0 hrs",
    lessonsCount: 4,
    tags: ["Kubernetes", "GitOps", "ArgoCD", "eBPF", "Docker"],
    color: "from-cyan-500 to-blue-600",
    icon: "server",
    overview: "Geared for senior DevOps, SREs, and backend leads. Learn how top tech companies operate resilient Kubernetes infrastructure, automate rollouts via ArgoCD GitOps, and monitor network performance with eBPF.",
    prerequisites: "Comfortable with Docker containers, Linux command line, and basic Kubernetes architecture.",
    lessons: [
      {
        id: "k8s-01-advanced-scheduling",
        title: "Production Scheduling: Pod Topology Spread, Taints & Tolerations",
        readTime: "15 min",
        summary: {
          keyTakeaway: "Default scheduler round-robin can schedule all replicas in a single AWS availability zone. Pod Topology Spread Constraints guarantee high availability across failure domains.",
          architectureNotes: "Nodes across AZ-A, AZ-B, AZ-C. Spec: topologySpreadConstraints with maxSkew=1, whenUnsatisfiable=DoNotSchedule, topologyKey=topology.kubernetes.io/zone.",
          antiPatterns: "Relying solely on replica counts without pod anti-affinity or topology spread constraints."
        },
        deepDive: {
          concept: "When an entire cloud availability zone suffers an outage, a naive Kubernetes deployment can lose all replicas simultaneously. Using modern topology spread constraints guarantees even distribution across zones and nodes.",
          codeTitle: "topology-spread-deployment.yaml",
          codeLang: "yaml",
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  labels:
    app: payment-service
spec:
  replicas: 6
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: payment-service
      containers:
      - name: app
        image: payment-service:v2.4.0
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1024Mi"`,
          troubleshooting: "If pods remain in 'Pending' state with TopologySpreadConstraint Unsatisfied, verify that your cloud provider node groups are provisioned symmetrically across all target AZs."
        },
        quiz: {
          question: "What does 'maxSkew: 1' specify in a Kubernetes Pod Topology Spread Constraint?",
          options: [
            "Only 1 pod can fail per minute.",
            "The maximum permitted difference in matching pods between any two topological domains (e.g. zones).",
            "The CPU skew ratio between worker nodes.",
            "The number of backup container images to retain."
          ],
          correctIndex: 1,
          explanation: "maxSkew defines the maximum allowed difference between the number of matching pods in any two topology domains. A maxSkew of 1 ensures tight balance across failure domains."
        }
      },
      {
        id: "k8s-02-argocd-gitops",
        title: "Enterprise GitOps Workflows with ArgoCD & Rollouts",
        readTime: "14 min",
        summary: {
          keyTakeaway: "Direct kubectl apply in production causes configuration drift. GitOps enforces Git as the single source of truth with automated reconciliation.",
          architectureNotes: "Git Repo (Application manifests) -> ArgoCD Controller (detects drift) -> Auto-sync to Multi-Region K8s Clusters -> Argo Rollouts Canary step-weight traffic shift.",
          antiPatterns: "Storing decrypted secrets in Git repositories or letting CI runners hold cluster-admin credentials."
        },
        deepDive: {
          concept: "ArgoCD continuously compares the target state stored in Git with the live cluster state. When differences occur, ArgoCD initiates automated self-healing or alerts engineers, preventing snowflake cluster drift.",
          codeTitle: "argocd-application.yaml",
          codeLang: "yaml",
          code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/enterprise/infra-manifests.git
    targetRevision: main
    path: apps/order-service/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true`,
          troubleshooting: "Ensure 'prune: true' is carefully tested in staging so unintended file removals in Git do not inadvertently purge production databases."
        },
        quiz: {
          question: "What happens when someone manually runs 'kubectl edit' on an ArgoCD-managed cluster with selfHeal enabled?",
          options: [
            "The cluster rejects the command immediately with a 403 error.",
            "ArgoCD detects the drift and automatically reverts the live state back to the Git source configuration.",
            "ArgoCD commits the live change back into the Git repository.",
            "The node shuts down to prevent security breaches."
          ],
          correctIndex: 1,
          explanation: "With 'selfHeal: true', ArgoCD continuously monitors for configuration drift and immediately overrides manual out-of-band changes with the declaration committed in Git."
        }
      },
      {
        id: "k8s-03-ebpf-cilium",
        title: "High-Performance Networking & Security with eBPF & Cilium",
        readTime: "15 min",
        summary: {
          keyTakeaway: "Legacy iptables rules scale with O(N) packet inspection overhead. Cilium uses Linux kernel eBPF programs for O(1) packet routing, L7 API observability, and encryption.",
          architectureNotes: "Kernel space -> eBPF socket filters & XDP (eXpress Data Path) -> Bypasses heavy iptables connection tracking -> Near bare-metal line rate speed.",
          antiPatterns: "Running iptables on clusters with over 5,000 services causing packet processing latency spikes."
        },
        deepDive: {
          concept: "Extended Berkeley Packet Filter (eBPF) allows running sandboxed code inside the Linux kernel without altering kernel source code. Cilium replaces iptables/IPVS to provide lightning-fast networking, L7 network policies, and transparent mTLS.",
          codeTitle: "cilium-l7-network-policy.yaml",
          codeLang: "yaml",
          code: `apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: secure-billing-api
  namespace: backend
spec:
  endpointSelector:
    matchLabels:
      app: billing-api
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend-gateway
    toPorts:
    - ports:
      - port: "8080"
        protocol: TCP
      rules:
        http:
        - method: "POST"
          path: "/v1/charge"`,
          troubleshooting: "Use 'cilium monitor' to debug dropped network packets in real-time right at the eBPF filter layer."
        },
        quiz: {
          question: "Why does eBPF-based networking (Cilium) perform better than traditional iptables in large-scale Kubernetes clusters?",
          options: [
            "eBPF runs exclusively on GPU hardware.",
            "iptables evaluates rules sequentially with O(N) complexity, while eBPF uses kernel hash tables for constant O(1) packet routing.",
            "eBPF disables all network security checks.",
            "iptables requires restarting worker nodes on every config update."
          ],
          correctIndex: 1,
          explanation: "In large clusters with thousands of services, iptables tables grow huge, forcing every packet through sequential rule evaluations. eBPF utilizes kernel maps (hash tables) for instantaneous O(1) lookups."
        }
      },
      {
        id: "k8s-04-canary-rollouts",
        title: "Automated Canary Deployments with Prometheus Metric Analysis",
        readTime: "16 min",
        summary: {
          keyTakeaway: "Blind blue-green deployments still risk widespread user outages. Argo Rollouts gradually increases traffic while automatically rolling back if error rates exceed thresholds.",
          architectureNotes: "Traffic: 5% -> Run Prometheus query (e.g. 5xx rate < 0.1%) -> 20% -> 50% -> 100%. Automatic instant rollback on metric breach.",
          antiPatterns: "Manual canary verification relying on human log inspection during deployment."
        },
        deepDive: {
          concept: "Automated canary analysis integrates directly with your Prometheus metrics. If error rate rises or p99 latency spikes during any canary step, traffic is immediately routed back to the stable replica set.",
          codeTitle: "canary-analysis-template.yaml",
          codeLang: "yaml",
          code: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: checkout-service
spec:
  replicas: 10
  strategy:
    canary:
      analysis:
        templates:
        - templateName: success-rate-check
        args:
        - name: service-name
          value: checkout-service
      steps:
      - setWeight: 10
      - pause: {duration: 5m}
      - setWeight: 30
      - pause: {duration: 10m}
      - setWeight: 100`,
          troubleshooting: "Always ensure the Prometheus evaluation window matches your service traffic volume; low-traffic services may have noisy statistical error spikes."
        },
        quiz: {
          question: "What triggers an automated rollback during an Argo Rollouts canary release?",
          options: [
            "A developer typing 'exit' in the terminal.",
            "The Prometheus Metric Analysis step failing configured threshold criteria (such as error rate > 1%).",
            "The Docker container taking longer than 2 seconds to download.",
            "Any change in git commit author."
          ],
          correctIndex: 1,
          explanation: "Argo Rollouts executes AnalysisRuns querying Prometheus. If metrics breach safety criteria (like HTTP 500 error percentage), the rollout automatically aborts and diverts traffic back to stable pods."
        }
      }
    ]
  },
  {
    id: "high-scale-system-design",
    title: "High-Scale Distributed Systems & Event-Driven Architecture",
    subtitle: "Design fault-tolerant distributed systems handling millions of events/sec: Kafka partitions, distributed consensus, and idempotent consumers.",
    category: "System Design & Architecture",
    badge: "Principal / Architect",
    level: "Staff / Principal",
    estHours: "6.0 hrs",
    lessonsCount: 3,
    tags: ["System Design", "Kafka", "Distributed Systems", "Saga Pattern", "Redis"],
    color: "from-emerald-500 to-teal-600",
    icon: "network",
    overview: "Built for senior backend engineers preparing for Staff+ engineering roles and system design interviews. Deep dive into distributed locking, outbox patterns, Kafka partitioning, and database sharding.",
    prerequisites: "Solid understanding of relational and NoSQL databases, REST/gRPC, and multi-threaded programming concepts.",
    lessons: [
      {
        id: "sys-01-transactional-outbox",
        title: "Guaranteed Event Delivery: The Transactional Outbox Pattern",
        readTime: "15 min",
        summary: {
          keyTakeaway: "Writing to a database and publishing to Kafka in two separate steps without 2-phase commit creates dual-write data inconsistency bugs. The Transactional Outbox pattern guarantees at-least-once delivery.",
          architectureNotes: "ACID DB Transaction writes Business Entity + Outbox Row. Separate Debezium CDC (Change Data Capture) or Poller streams Outbox Row into Kafka topic -> Consumers process with idempotency.",
          antiPatterns: "Calling Kafka producer inside an uncommitted SQL transaction."
        },
        deepDive: {
          concept: "Dual-write problems occur when an application updates a database and then attempts to send an event over the network. If the network fails or the server crashes between the two actions, state becomes permanently corrupted.",
          codeTitle: "transactional_outbox_handler.go",
          codeLang: "go",
          code: `package main

import (
	"database/sql"
	"encoding/json"
	"time"
)

type OutboxEvent struct {
	ID        string    \`json:"id"\`
	Aggregate string    \`json:"aggregate_type"\`
	Payload   string    \`json:"payload"\`
	CreatedAt time.Time \`json:"created_at"\`
}

func CreateOrderWithOutbox(db *sql.DB, orderID string, amount float64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert core business entity
	_, err = tx.Exec("INSERT INTO orders (id, amount, status) VALUES ($1, $2, 'PENDING')", orderID, amount)
	if err != nil {
		return err
	}

	// 2. Insert outbox record atomically in the SAME transaction
	payload, _ := json.Marshal(map[string]any{"order_id": orderID, "amount": amount})
	_, err = tx.Exec(
		"INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload) VALUES ($1, $2, $3, $4)",
		"Order", orderID, "OrderCreated", payload,
	)
	if err != nil {
		return err
	}

	return tx.Commit() // Both or neither succeed!
}`,
          troubleshooting: "Pair Outbox with Debezium Kafka Connect to read the Postgres Write-Ahead Log (WAL) directly instead of running polling SQL queries on the outbox table."
        },
        quiz: {
          question: "Why is saving to a database and directly sending an event to Kafka considered a dangerous distributed systems anti-pattern?",
          options: [
            "Kafka cannot process JSON messages.",
            "It is a dual-write problem: if the network or process crashes after the DB commit but before Kafka send, state becomes out-of-sync.",
            "SQL databases will automatically lock the Kafka broker.",
            "Kafka requires all database tables to have primary keys."
          ],
          correctIndex: 1,
          explanation: "Dual writes lack atomic cross-system transactions. If the process terminates between the DB commit and the message broker call, the downstream systems miss the event forever."
        }
      },
      {
        id: "sys-02-kafka-partitioning",
        title: "Mastering Apache Kafka: Consumer Groups & Rebalance Storms",
        readTime: "16 min",
        summary: {
          keyTakeaway: "Unbalanced partition keys cause hotspotting and head-of-line blocking. Misconfigured consumer heartbeat timeouts trigger catastrophic consumer group rebalance storms.",
          architectureNotes: "Producer -> Partition Key Hashing (Murmur2) -> Broker Partitions 0..N -> Consumer Group with Cooperative Sticky Assignor (KIP-429).",
          antiPatterns: "Using customer_id as partition key when one enterprise customer produces 80% of all platform traffic."
        },
        deepDive: {
          concept: "Apache Kafka provides horizontal throughput by partitioning topics. However, partition skew can overwhelm a single consumer while others sit idle. The Cooperative Sticky Assignor avoids the dreaded 'stop-the-world' rebalances of legacy eager rebalance protocols.",
          codeTitle: "kafka_consumer_resilience.properties",
          codeLang: "properties",
          code: `# Recommended resilient Kafka consumer configuration
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
max.poll.interval.ms=300000
heartbeat.interval.ms=3000
session.timeout.ms=45000
enable.auto.commit=false
max.poll.records=250`,
          troubleshooting: "If consumer lag spikes unexpectedly, verify whether batch processing in your consumer exceeds 'max.poll.interval.ms'. If exceeded, Kafka marks the consumer dead and triggers a rebalance."
        },
        quiz: {
          question: "What is the key benefit of the CooperativeStickyAssignor in Apache Kafka compared to eager assignors?",
          options: [
            "It turns Kafka into an in-memory Redis cache.",
            "It performs incremental rebalances where only migrated partitions are revoked, preventing stop-the-world pauses.",
            "It encrypts all Kafka messages with zero CPU cost.",
            "It automatically creates new partitions when lag increases."
          ],
          correctIndex: 1,
          explanation: "The cooperative sticky assignor incrementally reassigns partitions that need to move, while allowing untouched consumers to continue processing without stalling the entire group."
        }
      },
      {
        id: "sys-03-cache-stampede",
        title: "Distributed Caching: Cache Stampede, Thundering Herd & Mutex",
        readTime: "14 min",
        summary: {
          keyTakeaway: "When a popular key expires under 20,000 req/sec load, all requests miss cache simultaneously and smash the primary database. Prevent this with Probabilistic Early Expiration (XFetch) or Distributed Locks.",
          architectureNotes: "Client -> Redis GET -> Key close to expiry? -> Probabilistic async refresh in background worker -> Return cached value immediately without blocking caller.",
          antiPatterns: "Setting uniform TTLs (e.g. exactly 60 seconds) on high-frequency cached database rows."
        },
        deepDive: {
          concept: "Cache stampede occurs when high concurrency causes thousands of threads to recompute the same expired cache item simultaneously. Using XFetch algorithm, we refresh the cache proactively before it expires based on read compute time.",
          codeTitle: "xfetch_cache_stampede.ts",
          codeLang: "typescript",
          code: `interface CacheEntry<T> {
  value: T;
  delta: number; // Time in seconds taken to compute value
  expiry: number; // Unix timestamp in seconds
}

function shouldRefreshEarly<T>(entry: CacheEntry<T>, beta: number = 1.0): boolean {
  const now = Date.now() / 1000;
  // XFetch formula: -beta * delta * ln(random(0, 1))
  const randomFactor = -beta * entry.delta * Math.log(Math.random());
  return (now - randomFactor) >= entry.expiry;
}

// If true, trigger background re-fetch while immediately returning current cached value`,
          troubleshooting: "Always inject random jitter (+/- 10% variance) into cache TTLs to avoid synchronized bulk expirations."
        },
        quiz: {
          question: "What problem does the XFetch probabilistic early expiration algorithm solve?",
          options: [
            "It recovers deleted database tables.",
            "It prevents cache stampede by probabilistically refreshing hot cached data in the background before hard expiry.",
            "It compresses memory usage of Redis strings.",
            "It converts REST endpoints into GraphQL queries."
          ],
          correctIndex: 1,
          explanation: "XFetch predicts when to recalculate a cached value ahead of time based on computation cost and a random distribution, ensuring a background worker refreshes it before it completely expires."
        }
      }
    ]
  },
  {
    id: "devsecops-zerotrust",
    title: "Enterprise DevSecOps & Zero Trust Cloud Architecture",
    subtitle: "Enforce automated SBOM scanning, signed container images with Cosign/Sigstore, and dynamic cloud IAM least privilege.",
    category: "Security & Cloud Architecture",
    badge: "Critical Skill",
    level: "Senior / Lead",
    estHours: "4.0 hrs",
    lessonsCount: 3,
    tags: ["DevSecOps", "Zero Trust", "SBOM", "Cosign", "Cloud Security"],
    color: "from-amber-500 to-rose-600",
    icon: "shield-check",
    overview: "Crucial for tech leads and cloud architects. Modern cyber defense requires zero trust inside corporate VPCs: software supply chain security, automated vulnerability gates in CI/CD, and cryptographically signed artifacts.",
    prerequisites: "Basic understanding of CI/CD pipelines, container images, and public-key cryptography.",
    lessons: [
      {
        id: "sec-01-sbom-signing",
        title: "Software Supply Chain Security: SBOM Generation & Cosign Signing",
        readTime: "14 min",
        summary: {
          keyTakeaway: "Attackers increasingly compromise dependencies rather than production servers. Generating Software Bill of Materials (SBOM) and cryptographically signing containers blocks tampered images from running.",
          architectureNotes: "Build -> Syft generates SPDX SBOM -> Trivy scans vulnerabilities -> Cosign signs container image using keyless OIDC -> Kubernetes Kyverno policy enforces signature verification.",
          antiPatterns: "Deploying images using mutable tags like ':latest' without digest pinning or signature checks."
        },
        deepDive: {
          concept: "With Sigstore Cosign, developers can sign container images using ephemeral keys bound to OpenID Connect identities (e.g. GitHub Actions tokens). This removes the burden of managing long-lived private keys.",
          codeTitle: "cosign_github_actions.yaml",
          codeLang: "yaml",
          code: `name: Build, Scan and Sign Container
on: [push]

jobs:
  secure-build:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Required for keyless Sigstore signing
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t ghcr.io/myorg/api:\${{ github.sha }} .

      - name: Generate CycloneDX SBOM
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/myorg/api:\${{ github.sha }}
          format: cyclonedx-json

      - name: Sign Image with Cosign Keyless
        run: |
          cosign sign --yes ghcr.io/myorg/api:\${{ github.sha }}`,
          troubleshooting: "Verify that your cluster's admission controller (e.g., Kyverno or Gatekeeper) has network access to the Rekor public transparency log."
        },
        quiz: {
          question: "How does keyless signing in Sigstore/Cosign eliminate the risk of compromised private signing keys?",
          options: [
            "It turns off cryptographic encryption completely.",
            "It uses short-lived ephemeral certificates tied to verifiable OIDC identities (like GitHub Actions or Google IAM) logged in a transparency ledger.",
            "It stores private keys directly in environment variables.",
            "It requires the user to memorize a 256-bit password."
          ],
          correctIndex: 1,
          explanation: "Sigstore keyless signing generates an ephemeral keypair that exists for only minutes. The signature is bound to an authenticated OIDC identity and recorded in the Rekor transparency log, eliminating long-term private key storage risks."
        }
      },
      {
        id: "sec-02-zero-trust-mesh",
        title: "Zero Trust Architecture: Mutual TLS (mTLS) & Identity Verification",
        readTime: "15 min",
        summary: {
          keyTakeaway: "Perimeter firewalls are no longer enough. Under Zero Trust, every internal microservice call must authenticate, authorize, and encrypt traffic end-to-end.",
          architectureNotes: "Service A (SPIFFE ID: spiffe://cluster.local/ns/default/sa/order-service) -> SPIRE Agent -> Injected Envoy Sidecar -> mTLS Handshake with cryptographic identity validation -> Service B.",
          antiPatterns: "Assuming internal VPC traffic is secure and sending plain unencrypted HTTP between microservices."
        },
        deepDive: {
          concept: "The Secure Production Identity Framework for Everyone (SPIFFE) establishes cryptographic identities for workloads across heterogeneous environments, enabling zero-trust microservice communication.",
          codeTitle: "spiffe-workload-api.go",
          codeLang: "go",
          code: `// Conceptual SPIFFE X.509 SVID validation in Go
package main

import (
	"context"
	"fmt"
	"github.com/spiffe/go-spiffe/v2/spiffetls/tlsconfig"
	"github.com/spiffe/go-spiffe/v2/workloadapi"
)

func VerifyWorkloadIdentity(ctx context.Context) {
	// Connect to local SPIFFE Workload API unix socket
	source, err := workloadapi.NewX509Source(ctx)
	if err != nil {
		panic(err)
	}
	defer source.Close()

	svid, _ := source.GetX509SVID()
	fmt.Printf("Authenticated workload SPIFFE ID: %s\\n", svid.ID)
}`,
          troubleshooting: "When testing mTLS sidecars, configure proper liveness/readiness probe exemptions so kubelet health checks do not fail on unauthenticated probes."
        },
        quiz: {
          question: "What is the core principle of Zero Trust security in enterprise architecture?",
          options: [
            "Trust everyone within the internal office network or VPN.",
            "Never trust, always verify: every request must be authenticated, authorized, and encrypted regardless of network perimeter.",
            "Only permit connections originating from Windows workstations.",
            "Disable all firewalls to improve packet transmission speed."
          ],
          correctIndex: 1,
          explanation: "Zero Trust abandons the perimeter model ('castle-and-moat'). It assumes adversaries already exist inside the network; therefore, every single interaction must be cryptographically authenticated and authorized."
        }
      },
      {
        id: "sec-03-least-privilege-iam",
        title: "Dynamic Cloud IAM & Ephemeral Credentials",
        readTime: "13 min",
        summary: {
          keyTakeaway: "Hardcoded AWS Access Keys or service account credentials are the #1 source of cloud breaches. Use HashiCorp Vault or AWS IAM Roles for Service Accounts (IRSA) for short-lived credentials.",
          architectureNotes: "App Pod -> Requests IAM token -> OIDC Provider exchanges for STS AssumeRole token -> Ephemeral credentials valid for 15 minutes -> Automatic rotation.",
          antiPatterns: "Generating long-lived IAM access keys and embedding them into container environment variables."
        },
        deepDive: {
          concept: "Dynamic ephemeral credentials grant access strictly when needed and expire automatically within minutes, neutralizing the risk of leaked secrets in logs or git repositories.",
          codeTitle: "aws_irsa_service_account.yaml",
          codeLang: "yaml",
          code: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-processor-sa
  namespace: data-pipeline
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/DataBucketAccessRole
    eks.amazonaws.com/token-expiration: "900" # 15 minute lifespan`,
          troubleshooting: "Always verify trust relationships on the IAM role to ensure the OIDC subject condition matches the exact Kubernetes namespace and service account name."
        },
        quiz: {
          question: "Why are ephemeral, short-lived IAM credentials superior to static API access keys?",
          options: [
            "They cost less money from cloud providers.",
            "If leaked or intercepted, they expire within minutes and eliminate long-term credential exposure.",
            "They allow bypassing multi-factor authentication.",
            "They convert SQL queries into JSON documents."
          ],
          correctIndex: 1,
          explanation: "Ephemeral credentials automatically expire (often within 15-60 minutes). If accidentally captured in logs or compromised, an attacker has a tiny, quickly closing window of opportunity."
        }
      }
    ]
  }
];
