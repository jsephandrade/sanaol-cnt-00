# Sanaol Mobile App (Expo)

Cross-platform Expo Router application for the Sanaol canteen. The app targets two primary personas (staff handling day-to-day orders and managers supervising operations) and integrates with the REST backend exposed under `/api/*`.

## Tech Stack

- **Runtime:** Expo SDK 54 (React Native 0.81, React 19)
- **Navigation:** Expo Router (with React Navigation hooks)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State & Storage:** React Context, AsyncStorage
- **APIs & Auth:** Axios, Expo Auth Session (Google), Expo Local Authentication, Expo Camera
- **Animation & UI:** React Native Reanimated, Moti, Lucide React Native, Expo Linear Gradient

## Role-Based Feature Access

The following modules are implemented or planned in the UI. Use this matrix when enabling or hiding functionality per role:

### Account Management

- **Staff:** Login / Logout, Edit Password, Edit Information, Biometric Login (Face Scan)
- **Manager:** Same capabilities as Staff

### Inventory Management

- **Staff:** View Stock Levels, Update Stock Levels, Track Expiry Dates
- **Manager:** All Staff actions plus Manage Menu Items, Send Low Stock Alerts, Manage Restocking Schedule

### Order Handling

- **Staff:** Place Order, View Order Status, Handle Order Queue, Update Order Status, Track Bulk Order Progress
- **Manager:** Handle Order Queue, Update Order Status, Track Bulk Order Progress

### Payment & Transactions

- **Staff:** Process Cash / Online Payment, View Order History, View Payment Records
- **Manager:** All Staff actions plus Process Refunds

### Staff & Work Scheduling

- **Staff:** View Profile and Assigned Roles, View and Edit Shift Schedule
- **Manager:** All Staff actions plus Manage Attendance Records, Manage Leave Records

### Reports & Analytics (Manager Only)

- View Sales Reports (Daily / Monthly), Inventory Reports, Order & Transaction Reports, Staff Attendance Reports, Customer Purchase History

### Notifications

- **Staff:** Send Updates / Notifications, Receive Notifications, View Notifications
- **Manager:** Same capabilities as Staff

## Prerequisites

- Node.js **18.x** (Expo SDK 54 is compatible with Node 18 or 20; avoid 22 for now)
- npm **10.x** (ships with Node 18) or pnpm 9 if you prefer, but the repo contains an npm lockfile
- Git
- Expo CLI: you can work with `npx expo` (recommended) or install globally with `npm install --global expo@latest`
- Android Studio (with an emulator) and/or Xcode for native builds; Expo Go on a physical device works for development
- Watchman (macOS) for faster file watching

## Installation & Onboarding

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd mobile
   ```
2. **Install JavaScript dependencies**
   ```bash
   npm install
   ```
3. **Install missing peer dependencies (required for navigation and gesture support)**
   ```bash
   npx expo install @react-navigation/native @react-navigation/native-stack react-native-gesture-handler @react-native-masked-view/masked-view
   ```
   These packages are present in `package-lock.json` but not declared in `package.json`, so reinstalling them keeps the dependency graph explicit.
4. **Ensure React Native Reanimated is configured**
   - Add `"react-native-reanimated/plugin"` as the last entry in `babel.config.js > plugins` (required for Moti and animations).
   - If it is already present, no change is needed.
5. **Create the NativeWind global stylesheet**
   - `metro.config.js` references `./global.css`, but the file is not in version control.
   - Create `global.css` in the project root with:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```
6. **Configure environment values (see "Local Configuration" below).**
7. **Verify the toolchain**
   ```bash
   npx expo doctor
   ```
8. **Start the development server**
   ```bash
   npm run start         # starts Expo in Metro dev mode
   npm run android       # build & run on Android (requires emulator or device)
   npm run ios           # build & run on iOS (macOS + Xcode)
   npm run web           # run in a browser
   ```

## Local Configuration

### API Base URL

- Update `src/api/api.js` and set `BASE_URL` to your backend endpoint (`http://localhost:8000` when using a LAN connection, or the deployed URL).
- For multi-environment support consider introducing `app.config.js` or `app.config.ts` and exposing `EXPO_PUBLIC_API_URL`; then replace the constant with `process.env.EXPO_PUBLIC_API_URL`.

### Authentication Tokens

- The login flow stores `userEmail` and `userRole` in AsyncStorage. Uncomment the JWT storage lines in `loginUser` if the backend returns `accessToken` / `refreshToken`.

### Google OAuth

- Replace the placeholder IDs in `src/app/login.jsx`:
  ```js
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    androidClientId: '<YOUR_ANDROID_CLIENT_ID>',
    webClientId: '<YOUR_WEB_CLIENT_ID>',
  });
  ```
- Generate these IDs from the Google Cloud Console (OAuth client IDs) and ensure the Expo redirect URI is allowed.

### Biometric & Camera Permissions

- Face scan features rely on `expo-local-authentication` and `expo-camera`.
- Physical devices are required to test camera & biometrics; simulators will skip or mock these flows.

### Styling

- NativeWind is already wired through `tailwind.config.js` and `metro.config.js`. After creating `global.css`, you can add custom utility classes there as needed.

## Integration Points

- **Auth REST API (`src/api/api.js`):**
  - `POST /api/auth/login` (expects `{ email, password }` -> returns `{ success, message, role, email }`)
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/register`
- **Menu Management:**
  - `GET /api/menu/` fetches menu items.
  - `POST /api/menu/` creates new menu entries (Manager only).
- **Payment:**
  - `POST /api/payments/confirm` with `{ orderId, method }`.
- **Async Storage Keys:**
  - `userEmail`, `userRole`, (optional) `accessToken`, `refreshToken`.

Verify your backend implements these endpoints or adjust the client accordingly. When expanding functionality (e.g., bulk orders, scheduling), follow the same pattern inside `src/api/api.js`.

## Project Structure

```
mobile/
|-- app.json
|-- babel.config.js
|-- metro.config.js
|-- package.json
|-- src/
|   |-- api/                # REST helpers (axios)
|   |-- app/                # Expo Router routes: auth, tabs, cart, screens
|   |-- components/         # Reusable UI pieces (headers, modals, lists)
|   |-- context/            # React context providers (cart, dietary, notifications)
|   `-- utils/              # Helper utilities (auth prototypes, etc.)
`-- assets/                 # Images and branding
```

## Available npm Scripts

- `npm run start` - Launch Expo development server.
- `npm run android` - Build and run the native Android app.
- `npm run ios` - Build and run the native iOS app (macOS only).
- `npm run web` - Run the project in a web browser.

## Known Gaps & Follow-Up Tasks

- `@react-navigation/native` and peers are not listed in `package.json`. Reinstall them (see step 3) and commit the updated manifest to avoid future install drift.
- `react-native-reanimated` requires the Babel plugin; add it to prevent runtime warnings (`TypeError: undefined is not an object (evaluating 'Reanimated.default')`).
- `global.css` is referenced but missing - see step 5.
- Several source comments contain mojibake characters due to encoding; re-save files with UTF-8 to clean them up.
- `src/utils/auth.js` still points to `https://reqres.in` as a mock API. Either update it to use your production backend or delete the helper to avoid confusion.

## Troubleshooting

- **Metro cannot resolve `./global.css`:** Create the file as described in the setup section.
- **Animations or Moti components crash:** Ensure the Reanimated Babel plugin is configured and rebuild the app (`expo start -c`).
- **Network calls fail on device:** When testing over LAN, replace the local IP in `BASE_URL` with your machine's IP address reachable from the device, or use Expo tunnels (`npx expo start --tunnel`).
- **Google Sign-In redirect loops:** Call `WebBrowser.maybeCompleteAuthSession()` (already included) and confirm your OAuth redirect URI matches the Expo project slug.

## Developer Onboarding Checklist

- [ ] Install dependencies and verify with `npx expo doctor`.
- [ ] Configure API endpoints and credentials.
- [ ] Run the app on at least one physical device to validate camera/biometric flows.
- [ ] Review role-based modules to ensure UI visibility matches Staff vs Manager permissions.
- [ ] Document any additional dependencies you introduce (update `package.json`, `README.md`).

Happy shipping!
