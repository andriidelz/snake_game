import 'react-native-get-random-values';
import { TextEncoder, TextDecoder } from 'text-encoding';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { registerRootComponent } from 'expo';
import App from './App';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

registerRootComponent(App);