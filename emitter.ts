import { NativeEventEmitter, NativeModules } from "react-native";

export const emitter = new NativeEventEmitter(NativeModules.Emitter);
