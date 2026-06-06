/** @jsxImportSource @opentui/solid */
import { createSignal, onCleanup, onMount } from "solid-js";
import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui";

const BALANCE_URL = "https://api.deepseek.com/user/balance";
const REFRESH_INTERVAL_MS = 60_000;
const SIDEBAR_ORDER = 55;

interface BalanceResponse {
  balance_infos: { currency: string; total_balance: string; topped_up_balance: string }[];
}

const GREEN = "#22c55e";
const ORANGE = "#f97316";
const RED = "#ef4444";

function isDeepSeek(p: any): boolean {
  const id = String(p.id ?? "").toLowerCase();
  if (id.includes("deepseek")) return true;
  const bu = String(p.options?.baseURL ?? p.options?.baseUrl ?? "").toLowerCase();
  return bu.includes("deepseek.com") || bu.includes("deepseek.ai");
}

function findDeepSeekKey(api: TuiPluginApi): string | undefined {
  const provs = api.state.provider ?? [];
  for (const p of provs) {
    if (!isDeepSeek(p)) continue;
    if (p.key) return p.key;
    if (typeof p.options?.apiKey === "string" && p.options.apiKey) return p.options.apiKey;
  }
  return undefined;
}

function DeepseekView(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current;

  const [status, setStatus] = createSignal("loading...");
  const [statusColor, setStatusColor] = createSignal(theme().textMuted);

  const fetchBalance = async () => {
    const apiKey = findDeepSeekKey(props.api);
    if (!apiKey) {
      setStatus("no key");
      setStatusColor(ORANGE);
      return;
    }

    try {
      const res = await fetch(BALANCE_URL, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) {
        setStatus(`API ${res.status}`);
        setStatusColor(RED);
        return;
      }
      const data = (await res.json()) as BalanceResponse;
      const info = data.balance_infos?.[0];
      if (info) {
        const amount = parseFloat(info.topped_up_balance || info.total_balance).toFixed(2);
        setStatus(`${info.currency} ${amount}`);
        setStatusColor(GREEN);
      } else {
        setStatus("no data");
        setStatusColor(ORANGE);
      }
    } catch {
      setStatus("unreachable");
      setStatusColor(RED);
    }
  };

  onMount(() => {
    void fetchBalance();
    const timer = setInterval(() => void fetchBalance(), REFRESH_INTERVAL_MS);
    onCleanup(() => clearInterval(timer));
  });

  return (
    <box width="100%" flexDirection="column">
      <box flexDirection="row" justifyContent="space-between" width="100%">
        <text fg={theme().accent}><b>DEEPSEEK</b></text>
        <text fg={statusColor()}>{status()}</text>
      </box>
    </box>
  );
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: SIDEBAR_ORDER,
    slots: { sidebar_content(_ctx, _props) { return <DeepseekView api={api} />; } },
  });
};

const plugin: TuiPluginModule & { id: string } = {
  id: "four-opencode-deepseek-meter",
  tui,
};

export default plugin;
