import { View, Text, StyleSheet } from "react-native";
import { Query } from "@tanstack/react-query";
import { TanstackLogo } from "./query-browser/svgs";
import { getQueryStatusColor } from "../utils/getQueryStatusColor";

interface RnBetterDevToolsBubbleContentProps {
  selectedQuery?: Query;
  queryCount: number;
  mutationCount: number;
}

export function RnBetterDevToolsBubbleContent({
  selectedQuery,
  queryCount,
  mutationCount,
}: RnBetterDevToolsBubbleContentProps) {
  const getQueryIndicator = () => {
    if (selectedQuery) {
      try {
        const statusColor = getQueryStatusColor({
          queryState: selectedQuery.state,
          observerCount: selectedQuery.getObserversCount(),
          isStale: selectedQuery.isStale(),
        });

        const colorMap: Record<string, string> = {
          blue: "#3B82F6",
          gray: "#6B7280",
          purple: "#8B5CF6",
          yellow: "#F59E0B",
          green: "#10B981",
        };

        return (
          <Text
            style={[
              styles.statusIndicator,
              { color: colorMap[statusColor] || "#9CA3AF" },
            ]}
          >
            ●
          </Text>
        );
      } catch {
        return <TanstackLogo />;
      }
    }

    return <TanstackLogo />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getQueryIndicator()}
      </View>
      <Text style={styles.countText}>
        {queryCount}q {mutationCount > 0 && `${mutationCount}m`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIndicator: {
    fontSize: 12,
    fontWeight: "bold",
  },
  countText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
  },
});