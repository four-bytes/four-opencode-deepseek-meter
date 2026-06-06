/** @jsxImportSource @opentui/solid */
import { createSignal, createMemo, onCleanup, onMount, Show } from "solid-js";
import type { TuiPlugin } from "@opencode-ai/plugin/tui";

const BALANCE_URL = "https://api.deepseek.com/user/balance";
const REFRESH_INTERVAL_MS = 30_000;
const SIDEBAR_ORDER = 55;

interface Palette {
  subtle: string;
  text: string;
  muted: string;
  accent: string;
  warning: string;
}

const getPalette = (theme: Record<string, unknown>): Palette => {
  const get = (name: string, fallback: string): string => {
    const value = theme[name];
    if (typeof value === "string") return value;
    return fallback;
  };

  return {
    subtle: get("borderSubtle", "#2a2a2a"),
    text: get("text", "#f0f0f0"),
    muted: get("textMuted", "#a5a5a5"),
    accent: get("primary", "#5f87ff"),
    warning: get("warning", "#d7a94b"),
  };
};

interface BalanceInfo {
  currency: string;
  total_balance: string;
  granted_balance: string;
  topped_up_balance: string;
}

interface BalanceResponse {
  is_available: boolean;
  balance_infos: BalanceInfo[];
}

const BALANCE_GREEN = "#22c55e";
const BALANCE_YELLOW = "#eab308";
const BALANCE_ORANGE = "#f97316";
const BALANCE_RED = "#ef4444";

const BalanceRow = (props: { palette: Palette; label: string; value: string; color?: string }) => (
  <box width="100%" flexDirection="row">
    <box flexGrow={1}>
      <text fg={props.palette.muted}>{props.label}</text>
    </box>
    <box justifyContent="flex-end">
      <text fg={props.color ?? props.palette.text}>{props.value}</text>
    </box>
  </box>
);

const DeepseekBalance = (props: { palette: Palette }) => {
  const [balance, setBalance] = createSignal<BalanceInfo | null>(null);
  const [isAvailable, setIsAvailable] = createSignal(true);
  const [loading, setLoading] = createSignal(true);
  const [errorMsg, setErrorMsg] = createSignal("");

  const fetchBalance = async () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      setErrorMsg("DEEPSEEK_API_KEY not set");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(BALANCE_URL, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BalanceResponse;
      const info = data.balance_infos?.[0];
      if (info) {
        setBalance(info);
        setIsAvailable(data.is_available);
        setErrorMsg("");
      } else {
        setErrorMsg("No balance data");
      }
    } catch {
      if (!balance()) {
        setErrorMsg("DeepSeek API unreachable");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalNum = createMemo(() => {
    const b = balance();
    if (!b) return 0;
    return parseFloat(b.total_balance) || 0;
  });

  const balanceColor = createMemo(() => {
    const n = totalNum();
    if (n <= 0) return BALANCE_RED;
    if (n < 1) return BALANCE_ORANGE;
    if (n < 10) return BALANCE_YELLOW;
    return BALANCE_GREEN;
  });

  const formatBalance = (value: string) => {
    const n = parseFloat(value);
    if (isNaN(n)) return value;
    return n.toFixed(2);
  };

  const toppedUp = createMemo(() => {
    const b = balance();
    if (!b) return "";
    const amount = b.topped_up_balance || b.total_balance;
    return `${b.currency} ${formatBalance(amount)}`;
  });

  const granted = createMemo(() => {
    const b = balance();
    if (!b?.granted_balance) return "";
    return `${b.currency} ${formatBalance(b.granted_balance)}`;
  });

  onMount(() => {
    void fetchBalance();
    const timer = setInterval(() => void fetchBalance(), REFRESH_INTERVAL_MS);
    onCleanup(() => clearInterval(timer));
  });

  return (
    <box width="100%" flexDirection="column">
      <box flexDirection="row" justifyContent="space-between" width="100%">
        <text fg={props.palette.accent}>
          <b>DEEPSEEK</b>
        </text>
        <Show when={loading()}>
          <text fg={props.palette.muted}>...</text>
        </Show>
      </box>

      <Show when={errorMsg()}>
        {(msg) => <text fg={props.palette.warning}>{msg()}</text>}
      </Show>

      <Show when={!loading() && balance()}>
        <BalanceRow palette={props.palette} label="balance" value={toppedUp()} color={balanceColor()} />
        <Show when={granted()}>
          <BalanceRow palette={props.palette} label="granted" value={granted()} />
        </Show>
        <Show when={!isAvailable()}>
          <text fg={props.palette.warning}>⚠ unavailable</text>
        </Show>
      </Show>
    </box>
  );
};

const SidebarBalance = (props: { theme: Record<string, unknown> }) => {
  const palette = createMemo(() => getPalette(props.theme));
  return <DeepseekBalance palette={palette()} />;
};

const tui: TuiPlugin = (api) => {
  api.slots.register({
    order: SIDEBAR_ORDER,
    slots: {
      sidebar_content(ctx) {
        return <SidebarBalance theme={ctx.theme.current as Record<string, unknown>} />;
      },
    },
  });

  return Promise.resolve();
};

export default {
  id: "four-opencode-deepseek-meter",
  tui,
};
