import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function Home() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/fit image/screen.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.text}>PULSE. POWER. PRECISION.</Text>

      <TouchableOpacity
        style={{
          backgroundColor: "black",
          padding: 10,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "blue", fontSize: 18 }}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 100,

    width: "100%",
    textAlign: "center",
  },
});

export default Home;
