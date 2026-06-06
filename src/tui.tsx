/** @jsxImportSource @opentui/solid */
import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui";

const BALANCE_URL = "https://api.deepseek.com/user/balance";
const MIN_REFRESH_INTERVAL_MS = 10_000;
const SIDEBAR_ORDER = 55;

interface BalanceResponse {
  balance_infos: { currency: string; total_balance: string; topped_up_balance: string }[];
}

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

function DeepseekView(props: { api: TuiPluginApi; session_id?: string }) {
  const theme = () => props.api.theme.current;

  const [status, setStatus] = createSignal("loading...");
  const [statusColor, setStatusColor] = createSignal(theme().textMuted);

  let lastFetch = 0;

  const fetchBalance = async () => {
    const apiKey = findDeepSeekKey(props.api);
    if (!apiKey) {
      setStatus("no key");
      setStatusColor(theme().warning);
      return;
    }

    try {
      const res = await fetch(BALANCE_URL, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) {
        setStatus(`API ${res.status}`);
        setStatusColor(theme().error);
        return;
      }
      const data = (await res.json()) as BalanceResponse;
      const info = data.balance_infos?.[0];
      if (info) {
        const amount = parseFloat(info.topped_up_balance || info.total_balance).toFixed(2);
        setStatus(`${info.currency} ${amount}`);
        setStatusColor(theme().success);
      } else {
        setStatus("no data");
        setStatusColor(theme().warning);
      }
    } catch {
      setStatus("unreachable");
      setStatusColor(theme().error);
    }
  };

  const throttledFetch = () => {
    const now = Date.now();
    if (now - lastFetch < MIN_REFRESH_INTERVAL_MS) return;
    lastFetch = now;
    void fetchBalance();
  };

  const lastMsg = createMemo(() => {
    if (!props.session_id) return null;
    const msgs = props.api.state.session.messages(props.session_id);
    return msgs[msgs.length - 1];
  });

  createEffect(() => {
    const last = lastMsg();
    if (last?.role === "assistant") throttledFetch();
  });

  onMount(() => {
    void fetchBalance();
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
    slots: {
      sidebar_content(_ctx, props) {
        return <DeepseekView api={api} session_id={props.session_id} />;
      },
    },
  });
};

const plugin: TuiPluginModule & { id: string } = {
  id: "four-opencode-deepseek-meter",
  tui,
};

export default plugin;
