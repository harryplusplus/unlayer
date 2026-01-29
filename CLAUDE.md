# 작업자 가이드

## 작업 지침

### 모르는 것이 있으면 물어보세요

서로간의 합의는 협업에서 제일 중요합니다.
많은 업무 결정들은 그 상황을 기반으로 합니다.
하지만 그 상황에서 특정 정보가 사실이 아닐 수도 있고, 새로운 정보가 들어올 수도 있습니다.
그렇기 때문에 다시 판단하는 것은 잘못된 것이 아닙니다.
상황이 달라질 수 있기 때문입니다.

### 동작하지 않는 소프트웨어는 아무것도 하지 않은 것 이하의 기회비용을 만듭니다

동작하지 않는 소프트웨어는 아무런 가치가 없습니다.
동작하지 않는 소프트웨어를 만들기 위해 사용된 자원이 있기 때문에 오히려 심각한 손해입니다.
당신은 모래성을 만들기 위한 작업자가 아닙니다.
견고한 탑을 구축하기 위한 작업자입니다.
당신의 작업으로 인해 유지관리자가 고통받을 수 있습니다.

### 소프트웨어의 본질은 유연함에 있습니다

소프트웨어는 하드웨어가 아닙니다.
유연합니다.
정해진 일은 하드웨어로도 구현할 수 있습니다.
소프트웨어가 유연하기 때문에 소프트웨어로 제품을 구현하는 것입니다.
여러가지 이유로 소프트웨어는 변경이 됩니다.
새로운 기능을 요청받아 구현해야 할 수 있습니다.
비용이나 안정성 문제로 소프트웨어를 구동시킬 실행 환경이 바뀔 수 있습니다.
보안 이슈를 해결하기 위해 사용 중인 라이브러리의 버전을 올릴 수 있습니다.
사용 중인 라이브러리가 특정 기능을 지원하지 않아 다른 것으로 변경할 수 있습니다.
사용자가 증가해서 소프트웨어의 처리 한계를 넘어설 수 있습니다.
이처럼 다양한 입력과 상황의 변경이 발생하면 소프트웨어는 고장날 수 있습니다.

### 소프트웨어가 고장나지 않도록 하려면 어떻게 해야할까요?

테스트를 합니다.
테스트는 입력과 상황을 재현하고 의도한 출력이 나오는지 확인하는 것입니다.
함수가 의도한 값을 반환하는지 확인하기 위해 유닛 테스트를 합니다.
API 서버와 DB가 올바르게 동작하는지 확인하기 위해 통합 테스트를 합니다.
쉽게 예상하지 못 했던 케이스가 발생하면 해당 케이스를 테스트로 작성하고 보장하게 합니다.
작성한 모듈이 테스트하기 어려운 구조라면 어떻게 해야할까요?
테스트하기 좋은 모듈을 만드세요.
상태를 소유하지 말고 주입하세요.
상태를 주입하는 것은 테스트 상태를 구성하기 쉽게 만듭니다.
복잡한 것은 단순한 것의 조합으로 변경하세요.
단순한 것은 테스트하기 쉽습니다.
HTTP, DB 요청같은 외부 시스템도 주입할 수 있게 하세요.
도메인 로직 테스트에 문제가 없다면 문제 발생시 외부 시스템 문제인지 판단하기 쉽게 만들어줍니다.
모든 것을 테스트할 수는 없습니다.
하지만 테스트는 신뢰 구간을 확장하고 비신뢰 구간과의 경계를 명확히 해줍니다.

### 소프트웨어 개발 원칙을 상기하세요

소프트웨어 개발에 정답은 없습니다.
하지만 보편적인 답은 있습니다.
아래 소프트웨어 개발 원칙은 보편적인 답을 담고 있습니다.
문제를 해결할 때 보편적인 답으로 먼저 해결을 시도하세요.

- Keep it simple, stupid
	- https://en.wikipedia.org/wiki/KISS_principle
- You aren't gonna need it
	- https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it
- Self-documenting code
	- https://en.wikipedia.org/wiki/Self-documenting_code
- SOLID
	- https://en.wikipedia.org/wiki/SOLID
- Don't repeat your self
	- https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
- Single source of truth
	- https://en.wikipedia.org/wiki/Single_source_of_truth
- Don't Sync State. Derive It! (for React dev)
	- https://kentcdodds.com/blog/dont-sync-state-derive-it

## codebase 사용법

codebase는 cli 도구입니다.
아래 예제와 같이 검색할 수 있습니다.
`--top-k` 인자를 지정하지 않을 경우 기본값은 5입니다.

```bash
# 코드 검색
codebase search "jwt auth implementation"

# 결과 개수 지정
codebase search "translator" --top-k 10 
```

아래 예제는 codebase search 결과입니다.

```json
[
  {
    "rank": 1,
    "file_path": "src/auth.ts",
    "distance": 0.1234,
    "content": "..."
  }
]
```

결과는 json 배열 문자열입니다.
배열 아이템의 각 프로퍼티의 의미입니다.
- `rank`: 유사도 순위. 1이 가장 관련성 높음. 각 rank는 1, 2, 3, ... 오름차순임.
- `distance`: 유클리드 거리. 작을수록 유사함. 0이 가장 유사성이 높음.
- `content`: 파일 전체 내용.

## 작업 루틴

### 계획하기

계획을 진행하며 유사한 코드가 있는지 확인합니다.
코드는 이전 계획들의 성공적인 결과물입니다.
codebase를 사용해 찾아봅니다.
또 파일명, 문자열 검색으로 요구사항과 관련있는 코드를 찾아봅니다.

### 작성하기

작성하기 전에도 유사한 코드가 있는지 확인합니다.
codebase를 사용해 찾아봅니다.
또 파일명, 문자열 검색으로 요구사항과 관련있는 코드를 찾아봅니다.
작성할 때 KISS, YAGNI, SOLID, DRY 등 소프트웨어 설계를 지켜주세요.

### 검증하기

검증하기를 설명하기에 앞서 중요한 내용을 먼저 공유합니다.
**모든 각 명령줄은 성공 종료해야 합니다.**
임의로 판단하지 마세요.
`vitest.config.ts`, `eslint.config.ts`, `tsconfig.ts`를 절대 수정하지 마세요.
**`eslint-disable`을 사용하지 않습니다.**
어떻게 해야할지 모르겠으면 물어보세요. 성심성의껏 도와드립니다.
#### 소스 파일 검증

각 소스 파일을 작성한 후 아래 명령어를 사용해 1차적으로 작업을 검증합니다.
lint는 prettier 포매터를 포함하고 있습니다.
lint와 싸우지 마세요.
특히 lint 룰 중 파일 라인수 300 제한, 함수 라인수 50 제한이 있습니다.
이는 작업자가 코드 보기 및 검색하기를 쉽게 만들어줍니다.
이 검사가 성공적이면 테스트 작성 단계로 넘어갑니다.

```bash
# lint 검사 및 prettier formatting
pnpm eslint --fix <file_path>

# 타입 유효성 검사
pnpm tsc --noEmit
```

#### 테스트 작성

각 소스 파일 검사가 성공적이면 테스트 파일을 `tests` 경로 하위에 작성합니다.
소스 파일 이름과 관련있게 작성해주세요. e.g. `tests/container.test.ts`, `tests/container-resolution.test.ts`
마찬가지로 lint 검사 및 타입 유효성 검사를 통과한 후 테스트 커버리지를 확인해주세요.
테스트 커버리지는 100%를 달성해야 합니다.

```bash
# lint 검사 및 prettier formatting
pnpm eslint --fix <file_path>

# 타입 유효성 검사
pnpm tsc --noEmit

# 테스트 커버리지 100% 달성 검사
pnpm vitest --run <file_path>
```

만약 작성한 코드가 테스트하기 어렵다면, 테스트하기 좋은 코드를 작성해야 합니다.
다시 계획 단계로 넘어가서 고민하고 다시 차례차례 검증해주세요.

#### 사용 사례 구현 및 검증

`examples` 경로 하위에 각 사용 사례를 파일 단위로 구현하고 검증합니다.
테스트와 마찬가지로 lint 검사 및 타입 유효성 검사를 통과한 후 테스트 커버리지를 확인해주세요.

```bash
# lint 검사 및 prettier formatting
pnpm eslint --fix <file_path>

# 타입 유효성 검사
pnpm tsc --noEmit

# 테스트 커버리지 100% 달성 검사
pnpm vitest --run <file_path>
```

사용 사례에 문제가 있으면, 설계에 문제가 있는 것입니다.
다시 계획 단계로 넘어가서 고민하고 다시 구현해주세요.

#### 프로젝트 검증

각 소스, 테스트 및 예제 파일이 검증에 통과하더라도 프로젝트 단위로 확인을 해야 합니다.

```bash
# 프로젝트 전체 lint 검사 및 prettier formatting
pnpm eslint --fix .

# 프로젝트 전체 타입 유효성 검사
pnpm tsc --noEmit

# 프로젝트 전체 테스트 검사
pnpm vitest --run .
```

