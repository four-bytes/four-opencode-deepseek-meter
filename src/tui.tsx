/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup, Show } from "solid-js";
import type { TuiPlugin } from "@opencode-ai/plugin/tui";

const BALANCE_URL = "https://api.deepseek.com/user/balance";
const POLL_MS = 60_000;

const GREEN = "#22c55e";
const YELLOW = "#eab308";
const RED = "#ef4444";
const ORANGE = "#f97316";

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

function DeepseekBalance() {
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
    } catch (err) {
      if (!balance()) {
        setErrorMsg("DeepSeek API unreachable");
      }
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    void fetchBalance();
    const timer = setInterval(() => void fetchBalance(), POLL_MS);
    onCleanup(() => clearInterval(timer));
  });

  const totalNum = () => {
    const b = balance();
    if (!b) return 0;
    return parseFloat(b.total_balance) || 0;
  };

  const balanceColor = () => {
    const n = totalNum();
    if (n <= 0) return RED;
    if (n < 1) return ORANGE;
    if (n < 10) return YELLOW;
    return GREEN;
  };

  const formatBalance = (value: string) => {
    const n = parseFloat(value);
    if (isNaN(n)) return value;
    return n.toFixed(2);
  };

  return (
    <box width="100%" flexDirection="column">
      <box flexDirection="row" justifyContent="space-between" width="100%">
        <text fg="#5f87ff">
          <b>DEEPSEEK</b>
        </text>
        <Show when={loading()}>
          <text fg="#a5a5a5">...</text>
        </Show>
      </box>

      <Show when={errorMsg()}>
        {(msg) => <text fg={ORANGE}>{msg()}</text>}
      </Show>

      <Show when={!loading() && !errorMsg() && balance()}>
        <box flexDirection="column" marginTop={0}>
          <box flexDirection="row" justifyContent="space-between">
            <text fg="#a5a5a5">
              {balance()!.currency} {balance()!.topped_up_balance ? "topped up" : "balance"}
            </text>
            <text fg={balanceColor()}>
              <b>
                {balance()!.currency}{" "}
                {formatBalance(balance()!.topped_up_balance || balance()!.total_balance)}
              </b>
            </text>
          </box>
          <Show when={balance()!.granted_balance && parseFloat(balance()!.granted_balance) > 0}>
            <box flexDirection="row" justifyContent="space-between">
              <text fg="#a5a5a5">granted</text>
              <text fg="#a5a5a5">
                {balance()!.currency} {formatBalance(balance()!.granted_balance)}
              </text>
            </box>
          </Show>
          <Show when={!isAvailable()}>
            <text fg={RED}>⚠ balance unavailable</text>
          </Show>
        </box>
      </Show>
    </box>
  );
}

const tui: TuiPlugin = (api) => {
  api.slots.register({
    order: 60,
    slots: {
      sidebar_content: () => <DeepseekBalance />,
    },
  });
  return Promise.resolve();
};

export default {
  id: "four-opencode-deepseek-meter",
  tui,
};
