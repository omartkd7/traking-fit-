import { Link } from "expo-router";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/fit image/screen.png")}
        style={styles.image}
      />

      <Link style={styles.button} href="/(tabs)">
        Go to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width,
    height,
  },
  button: {
    position: "absolute",
    alignSelf: "center",
    top: "70%",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    overflow: "hidden",
  },
});
