import { StyleSheet, View } from "react-native";
import Home from "./Home";
import Meun from "./Meun";

function Index() {
  return (
    <View style={styles.container}>
      <Home />
      <Meun />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Index;
