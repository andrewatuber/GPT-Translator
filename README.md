# 🌐 실시간 동시통역 모바일 앱

OpenAI Realtime API 기반 실시간 동시통역 React Native/Expo 앱

## ✨ 주요 기능

### 1. 🎤 실시간 통역
- 10개 언어 지원 (한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 러시아어, 베트남어, 태국어)
- 4가지 통역사 어투 선택
- 6가지 AI 목소리 선택
- 초단위 빠른 반응속도 (200-500ms)

### 2. 📊 토큰 사용량 추적
- **실시간 사용량 모니터링**
- 세션별 비용 계산 및 기록
- 일일/월간/전체 통계
- 최근 100개 세션 기록 저장
- OpenAI API 실제 비용 기반 ($0.06/분 입력 + $0.24/분 출력)

### 3. 💰 수익 모델 준비
- 사용자별 토큰 사용량 추적
- 향후 토큰 구매 기능 추가 예정
- 결제 시스템 통합 준비

## 🚀 실행 방법

### 개발 모드:

```bash
cd mobile-app

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 (테스트용)
npm run web
```

### Expo Go로 실제 기기에서 테스트:

1. **Expo Go 앱 설치**:
   - iOS: App Store에서 "Expo Go" 설치
   - Android: Play Store에서 "Expo Go" 설치

2. **개발 서버 시작**:
   ```bash
   cd mobile-app
   npx expo start
   ```

3. **QR 코드 스캔**:
   - iOS: 카메라 앱으로 QR 코드 스캔
   - Android: Expo Go 앱에서 QR 코드 스캔

## 📱 프로덕션 빌드

### iOS (App Store):
```bash
# EAS Build 설정
npx eas build:configure

# iOS 빌드
npx eas build --platform ios

# 제출
npx eas submit --platform ios
```

### Android (Play Store):
```bash
# Android 빌드
npx eas build --platform android

# 제출
npx eas submit --platform android
```

## ⚙️ 환경 설정

### 서버 URL 설정:
앱 내 "설정" 탭에서 서버 URL을 설정하세요:
- 로컬 테스트: `ws://localhost:3000`
- 네트워크: `ws://192.168.1.100:3000`
- HTTPS: `wss://your-server.com:3001`

## 📊 토큰 사용량 추적 시스템

### 자동 추적:
- ✅ 각 통역 세션의 시작/종료 시간 자동 기록
- ✅ 세션 길이 기반 비용 자동 계산
- ✅ 로컬 저장소에 안전하게 저장 (AsyncStorage)

### 표시 정보:
- 총 사용 금액
- 오늘 사용량
- 이번 달 사용량
- 세션 횟수
- 세션별 상세 내역

### 향후 추가 기능:
- [ ] 토큰 구매 시스템
- [ ] In-App Purchase 통합
- [ ] 사용량 제한 설정
- [ ] 구독 모델
- [ ] 결제 내역

## 🔧 기술 스택

- **프레임워크**: React Native (Expo)
- **오디오**: Expo AV
- **저장소**: AsyncStorage
- **네비게이션**: React Navigation
- **통신**: WebSocket
- **AI**: OpenAI Realtime API

## 📝 참고사항

### 현재 제한사항:
- React Native에서 실시간 오디오 스트리밍은 복잡합니다
- 완전한 기능을 위해서는 **PWA 버전 사용을 권장**합니다
- 네이티브 오디오 모듈 추가 구현 필요

### 권장 사용 방법:
1. **개발/테스트**: PWA 버전 사용
2. **프로덕션**: React Native 앱 + 추가 네이티브 모듈

## 🎯 다음 단계

1. ✅ PWA 완성 (홈 화면 설치 가능)
2. ✅ React Native 프로젝트 생성
3. ✅ 토큰 사용량 추적 시스템 구현
4. ⏳ 네이티브 오디오 모듈 통합
5. ⏳ 결제 시스템 연동
6. ⏳ App Store / Play Store 배포

# GPT-Translator
