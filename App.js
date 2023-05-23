import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import CONFIG from "react-native-config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    async function configurePuashNotification() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Push notification need the appropriate permissions"
        );
        return;
      }

      const pushTokenData = (
        await Notifications.getExpoPushTokenAsync({
          projectId: CONFIG.EXPO_PROJECT_ID,
        })
      ).data;
      console.log(pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePuashNotification();
  }, []);

  useEffect(() => {
    const subscriptionReceived = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RESPONSE");
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscriptionAction =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      });

    return () => {
      subscriptionReceived.remove();
      subscriptionAction.remove();
    };
  }, []);

  async function schedulteNotificationHandler() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "My First Local Notification",
        body: "This is the body of notification.",
        data: {
          userName: "Max",
        },
      },
      trigger: {
        seconds: 5,
      },
    });
  }

  function sendPushNotificationHandler() {
    console.log(CONFIG.EXPO_PUSH_TOKEN);

    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: CONFIG.EXPO_PUSH_TOKEN,
        title: "Test - sent from a device",
        body: "This is a test",
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={schedulteNotificationHandler}
      />
      <Button title="Send Push Notif" onPress={sendPushNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
