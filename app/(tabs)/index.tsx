import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GREEN = "#C8FF00";
const DARK  = "#0A0A0A";
const CARD  = "#1C1C1C";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ---- Header ---- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.appName}>FitTrack</Text>
            <Text style={styles.date}>OCT 24, 2024</Text>
          </View>
        </View>
        <Ionicons name="calendar-outline" size={24} color="#fff" />
      </View>

      {/* ---- Steps Circle ---- */}
      <View style={styles.circleWrapper}>
        <View style={styles.circle}>
          <Text style={styles.stepsNumber}>8,432</Text>
          <Text style={styles.stepsLabel}>/ 10,000 STEPS</Text>
        </View>
      </View>
      <Text style={styles.msgTitle}>Great momentum!</Text>
      <Text style={styles.msgSub}>{"You're 84% through your daily goal."}</Text>

      {/* ---- Stats Row ---- */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="footsteps" size={22} color={GREEN} />
          <Text style={styles.statValue}>8.4k</Text>
          <Text style={styles.statLabel}>STEPS</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="navigate" size={22} color={GREEN} />
          <Text style={styles.statValue}>6.2</Text>
          <Text style={styles.statLabel}>KM</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={22} color={GREEN} />
          <Text style={styles.statValue}>420</Text>
          <Text style={styles.statLabel}>KCAL</Text>
        </View>
      </View>

      {/* ---- Active Time ---- */}
      <View style={styles.activeCard}>
        <View>
          <Text style={styles.activeLabel}>ACTIVE TIME</Text>
          <Text style={styles.activeTime}>54m 12s</Text>
        </View>
        <View style={styles.barsRow}>
          {[20, 35, 55, 80, 100].map((h, i) => (
            <View key={i} style={[styles.bar, { height: h * 0.5 }]} />
          ))}
        </View>
      </View>

      {/* ---- Start Button ---- */}
      <TouchableOpacity style={styles.startBtn}>
        <Ionicons name="play" size={16} color="#000" />
        <Text style={styles.startText}>START SESSION</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  content:   { padding: 20, paddingBottom: 40 },

  // Header
  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar:     { width: 42, height: 42, borderRadius: 21, backgroundColor: "#555" },
  appName:    { color: "#fff", fontWeight: "bold", fontSize: 16 },
  date:       { color: "#888", fontSize: 12 },

  // Circle
  circleWrapper: { alignItems: "center", marginBottom: 20 },
  circle: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 14, borderColor: GREEN,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#111",
  },
  stepsNumber: { color: GREEN, fontSize: 38, fontWeight: "bold" },
  stepsLabel:  { color: "#888", fontSize: 14 },

  msgTitle: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
  msgSub:   { color: "#888", fontSize: 13, textAlign: "center", marginBottom: 24 },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 6 },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: 11 },

  // Active Time
  activeCard:  { backgroundColor: CARD, borderRadius: 16, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  activeLabel: { color: "#888", fontSize: 11, letterSpacing: 1 },
  activeTime:  { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 4 },
  barsRow:     { flexDirection: "row", alignItems: "flex-end", gap: 5 },
  bar:         { width: 10, backgroundColor: GREEN, borderRadius: 4 },

  // Button
  startBtn:  { backgroundColor: GREEN, borderRadius: 30, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 18, gap: 10 },
  startText: { color: "#000", fontWeight: "bold", fontSize: 16, letterSpacing: 1 },
});
