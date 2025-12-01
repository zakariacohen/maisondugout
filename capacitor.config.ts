import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.51aa8bb27b7b436da3dda3bd4751e822',
  appName: 'maisondugout',
  webDir: 'dist',
  // server: {
  //   url: 'https://51aa8bb2-7b7b-436d-a3dd-a3bd4751e822.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
