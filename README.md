# Đặt vấn đề

Trong lập trình, việc sử dụng JWT để xác thực đã quá thông dụng với chúng ta. Nhưng cũng vì thế mà đa phần chúng ta buộc phải triển khai nó một cách nhanh chóng để theo kịp tiến độ dự án, điều đó có thể làm cho các bạn mới học hoặc chưa tiếp xúc nhiều với JWT buộc phải sử dụng các source code có sẵn trên internet. Và đôi khi làm cho họ không hiểu được tường tận (vì không có thời gian để tìm hiểu) cách mà JWT hoặc Passport.js hoạt động cũng như cần triển khai như thế nào để đạt hiệu quả và tối ưu tính bảo mật.

Ở bài viết này mình sẽ hướng dẫn và giải thích cách mà chúng ta ứng dụng JWT và Passport.js vào dự án để thực hiện _authentication_ và _authorization_. Bên cạnh đó cũng ứng dụng package **node:crypto** vừa được NodeJS hoàn thiện ở version 19 để tạo ra các cặp key bất đối xứng dùng cho JWT. Hy vọng có thể giúp ích cho các bạn trong việc lập trình với dự án của mình.

# Thông tin package

- "@nestjs/jwt": "^10.0.3"
- "@nestjs/passport": "^9.0.3"
- "passport": "^0.6.0"
- "passport-local": "^1.0.0"
- "passport-jwt": "^4.0.1"
- "bcryptjs": "^2.4.3"
- "@types/passport-local": "^1.0.35"
- "@types/passport-jwt": "^3.0.8"

# 1. JWT hoạt động như thế nào

## 1.1 Cấu trúc

JWT thì không còn gì quá xa lạ với chúng ta nên mình sẽ nói sơ qua để tập trung vào phần code. cấu trúc của một JWT sẽ như hình bên dưới, gồm có 3 phần ngăn cách nhau bởi dấu "." :

- **Header**: chứa loại token (typ) và thuật toán (alg) dùng để mã hóa (HMAC SHA256 - HS256 hoặc RSA).
- **Payload**: chứa các nội dung của thông tin (claims) và được chia làm 3 loại: _reserved_, _public_ và _private_.
- **Signature**: được tạo ra bằng cách kết hợp **Header**, **Payload** và **Secret key**. JWT sẽ căn cứ vào phần này để verify xem token có hợp lệ hay không.
  ![](https://images.viblo.asia/4a449509-fcb5-470a-ba58-13236d6512e9.png)

**Lưu ý**: các phần của token được convert sang _Base-64_ nên có thể dễ dàng revert lại, do đó chúng ta không nên để các sensitive data như password bên trong claims.

## 1.2 Cách JWT verify token

![](https://images.viblo.asia/d848c93f-991f-4a24-9421-0385d7d56b64.jpg)
Quá trình xác thực tính hợp lệ trong JWT diễn ra như sau:

- Đầu tiên sẽ tạo ra giá trị S1 = giá trị của Signature trong token.
- Package JWT sẽ sign thông tin trong Header và Payload kết hợp với Secret key trong database để ra giá trị S2.
- So sánh giữa S1 = S2, nếu bằng nhau thì token hợp lệ và ngược lại.

# 2. Tại sao phải sử dụng passport

Ở phần này chúng ta sẽ cùng nhau giải quyết câu hỏi: "Với package JWT chúng ta hoàn toàn có thể tự mình sign và verify token để tiến hành authentication cho dự án. Vậy tại sao phải cần cài thêm Passport.js, có lợi ích gì không hay mà đa số các bài hướng dẫn về authentication đều sử dụng nó với JWT?"

Passport.js là một middleware xác thực user trong Node.js, cung cấp các chiến lược (strategy) xác thực khác nhau như OAuth, OpenID, Local Strategy, v.v. Việc sử dụng Passport.js giúp cho việc xác thực user trở nên dễ dàng và tiện lợi hơn nhờ vào các ưu điểm sau:

- **Đơn giản hóa quá trình xác thực người dùng**: Passport.js cung cấp cho các chiến lược xác thực phổ biến. Điều này giúp đơn giản hóa quá trình xác thực người dùng và không phải viết code xác thực lại từ đầu.

- **Cải thiện tính bảo mật của ứng dụng**: Passport.js được thiết kế để giảm thiểu các lỗ hổng bảo mật có thể xảy ra trong quá trình xác thực user. Nó sử dụng các chiến lược xác thực được chứng minh là an toàn và cung cấp các phương tiện để tùy chỉnh và cấu hình theo nhu cầu của ứng dụng.

- **Hỗ trợ nhiều loại xác thực**: Passport.js hỗ trợ nhiều loại xác thực khác nhau, bao gồm xác thực bằng local strategy, OAuth, OpenID, v.v. Điều này giúp cho ứng dụng của chúng ta trở nên linh hoạt và có thể tích hợp với nhiều dịch vụ xác thực khác nhau.

Quá trình xác thực trong dự án của chúng ta sử dụng các strategy như sau:

- User gọi API đăng nhập để lấy access token. Passport-local sẽ thông qua auth service sẽ tiến hành validate thông tin đăng nhập và trả về token cho user.
- User gửi kèm access token khi gọi các API khác. Passport-jwt sẽ tiến hành validate token và quyết định xem user có quyền truy cập hay không.

# 3 Cài đặt Passport-local

Cài đặt các package cần thiết:

- `npm install --save @nestjs/passport passport passport-local bcryptjs`

- `npm install --save-dev @types/passport-local`

## 3.1 Sign up

Trước khi bắt đầu với **passport** chúng ta cần tách API sign up ra khỏi API create user ở các bài trước để logic được rõ ràng và chuẩn hơn. Đi đến thư mục **src/modules** và tạo thêm module **auth** với lệnh `nest g res auth` (chúng ta không cần entity cho module này nên tất cả chọn _No_).

Sau đó tiến hành tạo API sign up:

- Cập nhật lại `AuthController`

```typescript:src/modules/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly auth_service: AuthService) {}

	@Post('sign-up')
	async signUp(@Body() sign_up_dto: SignUpDto) {
		return await this.auth_service.signUp(sign_up_dto);
	}
}
```

- Thêm vào `SignUpDto`

```typescript:src/modules/auth/dto/sign-up.dto.ts
import {
	IsEmail,
	IsNotEmpty,
	IsStrongPassword,
	MaxLength,
} from 'class-validator';
export class SignUpDto {
	@IsNotEmpty()
	@MaxLength(50)
	first_name: string;

	@IsNotEmpty()
	@MaxLength(50)
	last_name: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsStrongPassword()
	password: string;
}
```

- Thêm method signUp trong `AuthService`

```typescript:src/modules/auth/auth.service.ts
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from '@modules/users/users.service';
import { ConflictException,Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private readonly users_service: UsersService,
	) {}

	async signUp(sign_up_dto: SignUpDto) {
		try {
			const existed_user = await this.users_service.findOneByCondition({
				email: sign_up_dto.email,
			});
			if (existed_user) {
				throw new ConflictException('Email already existed!!');
			}
			const hashed_password = await bcrypt.hash(
				sign_up_dto.password,
				this.SALT_ROUND,
			);
			const user = await this.users_service.create({
				...sign_up_dto,
				username: `${sign_up_dto.email.split('@')[0]}${Math.floor(
					10 + Math.random() * (999 - 10),
				)}`, // Random username
				password: hashed_password,
			});
			return user;
		} catch (error) {
			throw error;
		}
	}
}
```

- Giải thích:
  - Vì email chúng ta đã thiết kế là unique nên cần kiểm tra trước khi tạo user mới.
  - Tương tự với username nhưng thay vì cho user nhập vào, mình sẽ cắt từ email và thêm vào 2-3 số phía sau
  - Chúng ta sẽ dùng package **bcrypt** để hash password.

Gọi POST http://localhost:3333/auth/sign-up để test thử API vừa tạo:

![image.png](https://images.viblo.asia/90e2d300-c6ad-490d-86ae-4dd2b0bee7b9.png)

> Lát nữa chúng ta sẽ đổi response thành access token nên không cần quan tâm serialize response.

## 3.2 Sign in

Quá trình đăng nhập của chúng ta sẽ được xử lí theo quy trình bên dưới.

> Hình

Mô tả:

- Đầu tiên request sẽ đến guard dựa theo [Request Lifecycle](https://viblo.asia/p/cach-request-lifecycle-hoat-dong-trong-nestjs-y3RL1awpLao). Chúng ta sẽ tạo `JwtAuthGuard` kế thừa từ `@nestjs/passport` kèm strategy name `local` để kích hoạt strategy.
- Sau khi request đến guard thì strategy của passport-local có name trùng với `jwt`sẽ được kích hoạt. Nhận vào thông tin đăng nhập (,chuyển đổi) và sau đó gửi đến method `validate` của nó.
- Method `validate` sẽ dùng các thông tin vừa được xử lí gọi service ở `AuthService` để xác thực user.
- Ở `AuthService` dùng **bcrypt** kiểm tra xem password có trùng khớp hay không. Trả về user hoặc lỗi dựa theo kết quả.
- Nếu thông tin hợp lệ sẽ chuyển đến logic bên trong method `signIn` của `AuthController`
- Method `signIn` dùng thông tin user để tạo ra `access_token` và `refresh_token` trả về cho user.

Tiến hành tạo các file để triển khai **passport-local**:

- Strategy:

```typescript:src/modules/auth/strategies/local.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly auth_service: AuthService) {
		super({ usernameField: 'email' }); // Mặc định là username, đổi sang email
	}

	async validate(email: string, password: string) {
		const user = await this.auth_service.getAuthenticatedUser(email, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
```

- **Chú thích**: mặc định passport-local nhận 2 fields là _username_ và _password_, do chúng ta dùng _email_ và _password_ nên cần đổi lại ở _contructor_ cho phù hợp.

```typescript:src/modules/auth/guards/local.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

- Có thể các bạn sẽ thắc mắc về giá trị `local` trong `AuthGuard` ở đâu ra khi ở trên `LocalStrategy` không có đề cập tới. Lý giải là do ở `LocalStrategy` phía trên chúng ta không khai báo stategy name nên passport-local tự động lấy giá trị mặc định là `local` (xem hình bên dưới), do đó ở `LocalAuthGuard` chúng ta chỉ cần sử dụng. Do đó nếu các bạn thêm vào strategy name ở `LocalStrategy` thì bắt buộc ở `LocalAuthGuard` phải khớp mới có thể hoạt động.

![image.png](https://images.viblo.asia/14ea3e71-30ef-4f05-a8de-f27de7684fe7.png)

> Các bạn có thể override lại các method của `AuthGuard` để mở rộng logic xác thực hoặc xử lý lỗi mặc định. Xem thêm [ở đây](https://docs.nestjs.com/recipes/passport#extending-guards).

- Logic xác thực user ở `AuthService`:

```typescript:src/modules/auth/auth.service.ts
...
async getAuthenticatedUser(email: string, password: string): Promise<User> {
    try {
        const user = await this.users_service.getUserByEmail(email);
        await this.verifyPlainContentWithHashedContent(password, user.password);
        return user;
    } catch (error) {
        throw new BadRequestException('Wrong credentials!!');
    }
}

private async verifyPlainContentWithHashedContent(
    plain_text: string,
    hashed_text: string,
) {
    const is_matching = await bcrypt.compare(plain_text, hashed_text);
    if (!is_matching) {
        throw new BadRequestException();
    }
}
...
```

- Giải thích:
  - `getAuthenticatedUser` sẽ chịu trách nhiệm kiểm tra xem thông tin đăng nhập của user có hợp lệ hay không.
  - Mình tách việc so sánh plain password với hashed password ra để tái sử dụng với chức năng refresh token.

Sau khi đã xác nhận user hợp lệ, việc tiếp theo chúng ta cần làm là tạo ra cặp `access_token` và `refresh_token` để trả về cho user.

> Giành cho bạn nào chưa biết thì **refresh_token** được dùng để tạo lại **access_token** mới khi access_token cũ hết hạn mà không cần phải đăng nhập lại. Vì nguyên nhân bảo mật nên access_token thường có thời gian hết hạn ngắn, tránh được trường hợp token bị leak thì hacker chỉ có thể sử dụng trong một khoảng thời gian ngắn.

- Tạo function generate token. Do lát nữa chúng ta sẽ thay secret key thành cặp key bất đối xứng nên không cần lưu vào env.

```typescript:src/modules/auth/auth.service.ts
...
generateAccessToken(payload: TokenPayload) {
    return this.jwt_service.sign(payload, {
        secret: 'access_token_secret',
        expiresIn: `${this.config_service.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        )}s`,
    });
}

generateRefreshToken(payload: TokenPayload) {
    return this.jwt_service.sign(payload, {
        secret: 'refresh_token_secret',
        expiresIn: `${this.config_service.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        )}s`,
    });
}
...
```

- Thêm biến môi trường

```typescript:.env.dev
...
JWT_ACCESS_TOKEN_EXPIRATION_TIME=1800 // = 30 phút
JWT_REFRESH_TOKEN_EXPIRATION_TIME=25200 // = 1 tuần
```

- Thêm vào method `signIn` ở `AuthController` để kết hợp các logic chúng ta vừa tạo xong.

```typescript:src/modules/auth/auth.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { RequestWithUser } from 'src/types/requests.type';
...
    @UseGuards(LocalAuthGuard)
    @Post('sign-in')
    async signIn(@Req() request: RequestWithUser) {
        const { user } = request;
		return await this.auth_service.signIn(user._id.toString());
    }
```

- Để JWT có thể hoạt động chúng ta cần import `JwtModule` vào `AuthModule`, do chúng ta dùng secret key và expiration time riêng nên không cần truyền gì vào option của `JwtModule.register`. Sau đó là thêm `LocalStrategy` vào provider.

```typescript:src/modules/auth/auth.module.ts
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
...
@Module({
	imports: [UsersModule, PassportModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [ AuthService, LocalStrategy ]
    ...
```

> Nếu các bạn gặp lỗi "Unknown authentication strategy" thường là do 2 nguyên nhân:
>
> - Strategy name ở guard và strategy không trùng khớp với nhau.
> - Quên không để strategy vào provider.

Tất cả đã hoàn thiện, mình sẽ thử login với account vừa tạo khi nảy để kiểm tra kết quả, **POST** http://localhost:3333/auth/sign-in.

- Khi thông tin không chính xác

![image.png](https://images.viblo.asia/217f6ba1-b2e4-4256-8496-0107d51787ed.png)

- Khi thông tin chính xác

![image.png](https://images.viblo.asia/6557d351-2fb2-4de9-b6fe-da0d05d79607.png)

Vậy là chúng ta đã xong phần đăng nhập với passport-local, tiếp theo chúng ta sẽ đến với phần xác thực tính hợp lệ token với passport-jwt để xem user có quyền truy cập vào API hay không.

# 4. Cài đặt Passport-jwt

Khi đã có token, user sẽ dùng token đó để truy vấn API, chúng ta sẽ dùng **passport-jwt** để tự động kiểm tra tính hợp lệ của token mà user gửi lên.

> Như đã nói ở trên nếu không dùng passport thì chúng ta phải tự viết 1 guard hoặc middleware để verify token, việc đó ít nhiều sẽ tốn thời gian và đôi khi nếu chúng ta sử dụng không đúng cách có thể làm giảm performance.

Tiến hành cài đặt

- `npm install --save passport-jwt`

- `npm install --save-dev @types/passport-jwt`

## 4.1 Verify access token

Quá trình verify token được triển khai như hình bên dưới:

![](https://images.viblo.asia/fad8a411-d588-4e05-9f80-808a03abce15.jpg)

- Request sẽ đến guard `JwtAccessTokenGuard` đầu tiên, tương tự với `LocalAuthGuard` nó được kế thừa từ `@nestjs/passport` kèm stategy name `jwt`.
- Tương ứng với strategy name `jwt` thì strategy `JwtAccessTokenStrategy` sẽ được kích hoạt. Nhận vào thông tin đăng nhập từ request và tiến hành verify token dựa theo _secret key_ được cung cấp trong _constructor_. Nếu token hợp lệ sẽ chuyển đến method `validate` ngược lại trả về lỗi **401 Unauthorized**.
- Method `validate`: đến dây thì user đã được xác thực, chúng ta sẽ lấy ra thông tin đầy đủ của user dựa theo `user_id` trong payload của token. Sau đó chuyển đến logic bên trong method handler của Controller.

Nội dung các file ở trên như sau:

- Strategy:

```typescript:src/modules/auth/strategies/jwt-access-token.strategy.ts
import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token.interface';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly users_service: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'access_token_secret',
		});
	}

	async validate(payload: TokenPayload) {
		return await this.users_service.findOne(payload.user_id);
	}
}
```

- Giải thích:

  - `jwtFromRequest`: nhận vào function có chức năng retrieve token từ request. Chúng ta dùng `ExtractJwt.fromAuthHeaderAsBearerToken` để lấy jwt token từ headers `Authorization`. Tùy theo nhu cầu dự án các bạn có thể lấy ra token từ các nơi khác dựa theo các method cung cấp bởi `ExtractJwt` như: _fromBodyField_, _fromUrlQueryParameter_, _fromExtractors_,...
  - `ignoreExpiration`: nếu là `true` thì token hợp lệ nhưng hết hạn vẫn có thể sử dụng để truy cập.
  - `secretOrKey`: secret key cho khóa đối xứng hoặc public key cho khóa bất đối xứng. Passport-jwt sẽ dùng key này để giải mã và verify token.

- Guard:

```typescript:src/modules/auth/guards/jwt-access-token.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard('jwt') {}
```

- Giải thích: tương tự với `LocalAuthGuard` giá trị mặc định nếu không khai báo strategy name của `JwtStrategy` là `jwt`, do chúng ta không khai báo ở `JwtAccessTokenStrategy` nên chỉ cần để giá trị mặc định là `jwt`.
- Thêm `JwtAccessTokenStrategy` vừa tạo vào provider của `AuthModule` để triển khai strategy này.

```typescript:src/modules/auth/auth.module.ts
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
...
@Module({
	...
	providers: [ AuthService, LocalStrategy, JwtAccessTokenStrategy ]
    ...
```

Việc cấu hình chỉ đơn giản vậy thôi, giờ chúng ta sẽ tích hợp vào API `findAll` của `UserController` để kiểm tra xem đã hoạt động hay chưa.

```typescript:src/modules/users/users.controller.ts
...
    @SerializeOptions({
		excludePrefixes: ['first', 'last'],
	})
	@Get()
	@UseGuards(JwtAccessTokenGuard) // Thêm vào đây
	findAll() {
		return this.users_service.findAll();
	}
    ...
```

Truy cập http://localhost:3333/users để xem kết quả

- Không thêm access token hoặc token không hợp lệ

![image.png](https://images.viblo.asia/a21c4096-45a5-49b2-a231-2c20a7c0c78b.png)

- Thêm access token vừa tạo từ API login

![image.png](https://images.viblo.asia/35716710-5808-4dc8-85ce-b9eb14d3129f.png)

## 4.2 Sử dụng JWT cho phạm vi controller

Trong một số trường hợp, khi hầu hết các API của 1 module đều cần xác thực thì việc thêm vào cho từng method handler sẽ mất thời gian và gây lặp code không cần thiết. Để giải quyết vấn đề đó, thay vì thêm vào cho từng method handler chúng ta sẽ thêm cho controller để áp dụng cho module đó hoặc phạm vi rộng hơn nữa là dùng `APP_GUARD` cho tất cả các module.

Ví dụ chúng ta sẽ thêm vào authentication cho toàn bộ API của module Topic ngoại trừ API findAll (GET /topics).

```typescript:src/modules/topics/topics.controller.ts
...
@Controller('topics')
@UseGuards(JwtAccessTokenGuard)
export class TopicsController { ... }
```

Để loại bỏ authentication cho 1 API cụ thể chúng ta sẽ tạo ra decorator sử dụng `SetMetadata` decorator factory function.

```typescript:src/decorators/auth.decorators.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Sau đó chúng ta cần chỉnh sửa lại `JwtAccessTokenGuard` để chỉnh sửa lại một phần logic authentication

```typescript:src/modules/auth/guards/jwt-access-token.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/auth.decorators';

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}
		return super.canActivate(context);
	}
}
```

Giải thích:

- Ở `Public` decorator chúng ta đã assign metadata `isPublic` với giá trị `true` vào method handle. Lưu ý việc assign này được thực hiện ở build time.
- `JwtAccessTokenGuard` sẽ override lại method `canActive` và như tên của nó method này sẽ được gọi khi request đến guard và **trước khi** đến strategy. Nếu kết quả return là `true` thì không cần trigger strategy.
- Bên trong method `canActive` mình dùng `reflector` kết hợp với `context` để lấy ra metadata mà chúng ta đã assign ở `Public` (trong trường hợp API findAll thì `context.getHandler()` sẽ là tên method handle `findAll` và `context.getClass()` là tên controller `TopicsController`)

Thêm decorator cho API findAll

```typescript:src/modules/topics/topics.controller.ts
...
@Controller('topics')
@UseGuards(JwtAccessTokenGuard)
export class TopicsController {
    ...
	@Get()
	@Public() // <=== Thêm vào đây
	findAll() {
		return this.topicsService.findAll();
	}
    ...
```

Tiến hành kiểm tra xem mọi thứ đã hoạt động chưa

- Gọi API tạo topic, POST http://localhost:3333/topics

![image.png](https://images.viblo.asia/711c3cdd-5864-475c-b194-7f79fc8704d4.png)

- Gọi API findAll topic, GET http://localhost:3333/topics

![image.png](https://images.viblo.asia/b96d2e07-be77-4d6d-9249-71973464bf1b.png)

Có thể thấy kết quả đã như chúng ta mong đợi, API findAll đã được public, không cần token vẫn có thể truy cập.

## 4.3 API Refresh Token

Việc xử lí logic refresh token như sau:

![](https://images.viblo.asia/ee7a4e0b-7f4f-4dad-add8-7118ed354585.jpg)

- Request sẽ đến `JwtRefreshTokenGuard` đầu tiên, tương tự với 2 guard ở trên nó được kế thừa từ `@nestjs/passport` kèm stategy name `jwt-refresh-token`.
- Tương ứng với strategy name `jwt-refresh-token` từ `JwtRefreshTokenGuard` thì `JwtRefreshTokenStrategy` được kích hoạt. Logic verify ở đây sẽ tương tự với `JwtAccessTokenStrategy.
- Ở method `validate` chúng ta cần lấy refresh token từ request gửi đến để so sánh xem có trùng khớp với token chúng ta đã lưu trong database hay không.
- Sau khi xác nhận token trùng khớp sẽ chuyển đến logic bên trong method `refreshAccessToken` để tạo `access_token` mới trả về cho user.

Chúng ta sẽ đi vào nội dung các file trên để tìm hiểu chi tiết hơn

- Trước tiên chúng ta cần thêm vào logic lưu refresh token của user vào database sau khi họ đăng ký hoặc đăng nhập

```typescript:src/modules/auth/auth.service.ts
    ...
    async signUp(sign_up_dto: SignUpDto) {
		try {
			...
			const refresh_token = this.generateRefreshToken({
				user_id: user._id.toString(),
			});
			await this.storeRefreshToken(user._id.toString(), refresh_token);
			return {
				access_token: this.generateAccessToken({
					user_id: user._id.toString(),
				}),
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

    async signIn(user_id: string) {
		try {
			const access_token = this.generateAccessToken({
				user_id,
			});
			const refresh_token = this.generateRefreshToken({
				user_id,
			});
			await this.storeRefreshToken(user_id, refresh_token);
			return {
				access_token,
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

    async storeRefreshToken(user_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.users_service.setCurrentRefreshToken(user_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}
    ...
```

- Strategy:

```typescript:src/modules/auth/strategies/jwt-refresh-token.strategy.ts
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'refresh_token',
) {
	constructor(
		private readonly auth_service: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'refresh_token_secret',
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: TokenPayload) {
		return await this.auth_service.getUserIfRefreshTokenMatched(
			payload.user_id,
			request.headers.authorization.split('Bearer ')[1],
		);
	}
}
```

```typescript:src/modules/auth/auth.service.ts
...
    async getUserIfRefreshTokenMatched(
		user_id: string,
		refresh_token: string,
	): Promise<User> {
		try {
			const user = await this.users_service.findOneByCondition({
				_id: user_id,
			});
			if (!user) {
				throw new UnauthorizedException();
			}
			await this.verifyPlainContentWithHashedContent(
				refresh_token,
				user.current_refresh_token,
			);
			return user;
		} catch (error) {
			throw error;
		}
	}
    ...

```

- Giải thích:

  - `passReqToCallback`: chúng ta thêm vào option này để truyền thông tin request vào method `validate`. Do đó ở method `validate` chúng ta sẽ có thêm thông tin request thay vì chỉ có payload của token. Từ request chúng ta lấy ra token. Vì token chúng ta dùng có dạng `Bearer {token}` nên chúng ta cần xử lý để lấy ra chính xác nội dung token.
  - Chúng ta lấy ra thông tin user và dùng bcrypt để kiểm tra với hashed refresh token được lưu trong database ở method `getUserIfRefreshTokenMatched`.

- Sau khi verify token và kiểm tra với database hợp lệ thì chúng ta sẽ trả về `access_token` mới cho user.

```typescript:src/modules/auth/auth.controller.ts
...
    @UseGuards(JwtRefreshTokenGuard)
	@Post('refresh')
	async refreshAccessToken(@Req() request: RequestWithUser) {
		const { user } = request;
		const access_token = this.auth_service.generateAccessToken({
			user_id: user._id.toString(),
		});
		return {
			access_token,
		};
	}
    ...
```

Tiến hành gọi API POST http://localhost:3333/auth/refresh để kiểm tra kết quả:

- Thử dùng access token để gọi

![image.png](https://images.viblo.asia/c1c52cef-e705-4e08-afe6-6bd8c3e7e2b6.png)

- Dùng refresh token để gọi

![image.png](https://images.viblo.asia/0367ae06-0560-4958-8c51-2c40b09a447a.png)

## 4.4 Authorization

Phân quyền cũng là một phần không thể thiếu trong dự án của chúng ta, mình sẽ lấy ví dụ ở module user khi muốn xóa user thì bắt buộc phải là Admin. Quá trình triển khai sẽ như bên dưới:

![](https://images.viblo.asia/8b5be7fa-526f-4d0c-a2f2-9000d46c4c4c.png)

- Đầu tiên chúng ta cần tạo decorator để set metadata cho method handler. Tương tự với decorator Public ở trên, chúng ta sẽ dùng để lấy ra các role được phép truy cập vào method handler đó.
- Do thông tin user đang đăng nhập ở JwtAccessTokenGuard hiện tại chưa có thông tin role nên cần chỉnh sửa lại để thêm vào.
- Sau đó chúng ta tạo thêm guard mang tên `RolesGuard` để triển khai logic so sánh role. Bên trong guard này sẽ lấy thông tin các role được phép truy cập từ metadata và kiểm tra xem user đang đăng nhập có nằm trong danh sách role vừa lấy ra không.

Nội dung file lần lượt theo trình tự như sau:

- Roles decorator:

```typescript:src/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);
```

- Cập nhật lại method get user trong `JwtAccessTokenGuard`. Mình sẽ tập trung vào logic authorization nên nội dung method `getUserWithRole` các bạn có thể copy từ repo của mình [ở đây.](https://github.com/nntwelve/Boilerplate-NestJS/blob/part-4-authentication-and-authorization/src/modules/users/users.service.ts)

```typescript:src/modules/auth/strategies/jwt-access-token.strategy.ts
...
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
    ...
    async validate(payload: TokenPayload) {
		return await this.users_service.getUserWithRole(payload.user_id);
        // user có dạng: user: {..., role: 'User'}
	}
    ...
```

- Tạo `RolesGuard`:

```typescript:src/modules/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES } from 'src/decorators/roles.decorator';
import { RequestWithUser } from 'src/types/requests.type';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly refector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const roles: string[] = this.refector.getAllAndOverride(ROLES, [
			context.getHandler(),
			context.getClass(),
		]);
		const request: RequestWithUser = context.switchToHttp().getRequest();
		return roles.includes(request.user.role as unknown as string);
	}
}
```

- Giải thích:
  - Biến `roles` là thông tin từ metadata
  - Chúng ta lấy ra thông tin user từ request bằng cách dùng method `getRequest` từ `context`.

> Do mình lười tạo interface mới cho request dạng này nên mới phải ép kiểu role về unknown sau đó đến string. Các bạn có thể tạo interface để cho code rõ ràng minh bạch hơn.

- Cuối cùng kết hợp mọi thứ vào API xóa user:

```typescript:src/modules/users/users.controller.ts
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
...
	@Delete(':id')
	@Roles(USER_ROLE.ADMIN)
	@UseGuards(RolesGuard)
	@UseGuards(JwtAccessTokenGuard)
	remove(@Param('id') id: string) {
		return this.users_service.remove(id);
	}
```

**Lưu ý quan trọng**: `RolesGuard` bắt buộc phải được đặt ở trên `JwtAccessTokenGuard` để có thể lấy ra thông tin user đang đăng nhập. Vì theo [Request Lifecycle](https://viblo.asia/p/cach-request-lifecycle-hoat-dong-trong-nestjs-y3RL1awpLao) các _guard_ nằm trong cùng scope sẽ được **thực thi từ dưới lên**, do đó `JwtAccessTokenGuard` cần đặt ở dưới để xử lý lấy ra user truyền vào request sau đó `RolesGuard` mới có thể lấy ra sử dụng.

Vậy là chúng ta đã phân quyền xong, nếu dự án các bạn có thêm các quyền khác thì có thể triển khai mở rộng dựa vào đây. Bài viết đang hơi dài nên các bạn hãy giúp mình test phần này. Nếu có lỗi gì hay comment bên dưới để chúng ta cùng giải quyết.

# 5. Khóa bất đối xứng

## 5.1 Tại sao dùng khóa bất đối xứng?

Từ đầu bài viết đến giờ chúng ta đã dùng secret key để mã hóa và giải mã token, đó gọi là khóa đối xứng. Chúng ta sẽ tìm hiểu sơ qua về khóa đối xứng và bất đối xứng với JWT:

- **Khóa đối xứng**: sử dụng cùng một secret key để _sign_ và _verify_ JWT. Khi sử dụng khóa đối xứng, sẽ sử dụng cùng một secret key để tạo và xác thực JWT. Vì vậy, nó được coi là nhanh và hiệu quả nhưng không hiệu quả để giải quyết vấn đề trong trường hợp secret key bị lộ và hacker sẽ tạo ra vô số token để chiếm dụng tài nguyên. Một bất lợi khác nữa là không thể sử dụng để thực hiện xác thực đối với bên thứ ba.

- **Khóa bất đối xứng**: sử dụng hai khóa: public key và private key. Khi sử dụng khóa bất đối xứng, chúng ta sử dụng private key để sign JWT và public key để verify JWT. Tính toàn vẹn của dữ liệu được đảm bảo bởi private key, trong khi tính xác thực của bên thứ ba được đảm bảo bởi public key. Tuy nhiên, việc sử dụng khóa bất đối xứng thường gây ra tốn kém về mặt thời gian và tài nguyên hơn so với sử dụng khóa đối xứng.

> Các bạn có thể thắc mắc là private key nếu bị leak thì vẫn bị chiếm dụng như ở khóa đối xứng. Để giải quyết vấn đề đó mình dùng package **node:crypto** được hoàn thiện ở **NodeJS** version 19 để tự động tạo ra cặp key này và sẽ không cần lưu vào bất cứ đâu để tránh việc bị lộ ra ngoài.

## 5.2 Cách sử dụng

Đầu tiên chúng ta sẽ dùng `node:crypto` tạo ra 2 cặp key cho 2 trường hợp là access token và refresh token.

> Package node:crypto có sẵn trong NodeJS các version sau này nên chúng ta không cần cài đặt.

```typescript:src/constraints/jwt.constraint.ts
import * as crypto from 'node:crypto';
// key pair for access token
export const { privateKey: at_private_key, publicKey: at_public_key } =
	crypto.generateKeyPairSync('rsa', {	modulusLength: 2048 });
// key pair for refresh token
export const { privateKey: rt_private_key, publicKey: rt_public_key } =
	crypto.generateKeyPairSync('rsa', {	modulusLength: 2048	});
```

- Giải thích:
  _ `rsa`: thuật toán dùng để tạo key. Hiện tại support các thuật toán sau: RSA, RSA-PSS, DSA, EC, Ed25519, Ed448, X25519, X448, and DH
  _ `modulusLength`: kích thước khóa tính bằng bits (RSA, DSA). Khuyến nghị dùng 4096, mình dùng 2048 để giảm độ dài token lại cho các bạn dễ quan sát.
  > Có 2 option `publicKeyEncoding` và `privateKeyEncoding` nếu các bạn nghiên cứu sâu hơn có thể tìm hiểu
  > Sau khi đã có các cặp key chúng ta sẽ thay đổi lại cho các hàm sign token ứng với các private key tương ứng

```typescript:src/modules/auth/auth.service.ts
import { at_private_key, rt_private_key } from 'src/constraints/jwt.constraint';
...
    generateAccessToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: at_private_key,
            // secret: 'access_token_secret',
			expiresIn: `${this.config_service.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: rt_private_key,
            // secret: 'refresh_token_secret',
			expiresIn: `${this.config_service.get<string>(
				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}
```

- Giải thích:
  - Chúng ta sẽ đổi từ dùng option secret sang private key, và nội dung sẽ là private key được tạo ở trên.
  - `algorithm: 'RS256'` do sử dụng khóa bất đối xứng nên chúng ta cần chỉ định đúng thuật toán. Nếu không sẽ gặp lỗi `secretOrPrivateKey must be a symmetric key when using HS256`

Tiến hành gọi lại API POST http://localhost:3333/auth/sign-in để kiểm tra, có thể thấy độ dài token đã thay đổi so với khi nảy chúng ta tạo với khóa đối xứng.

![image.png](https://images.viblo.asia/14ddb345-476b-4db4-a3bf-4fdc7cc9b041.png)

Lấy token vừa tạo gọi API GET http://localhost:3333/users.

![image.png](https://images.viblo.asia/34d01f33-1111-43f5-94c7-471c716e7465.png)

Chúng ta sẽ gặp lỗi 401 do chưa cập nhật lại key để verify cho JWT.

```typescript:src/modules/auth/strategies/jwt-access-token.strategy.ts
import { at_public_key } from 'src/constraints/jwt.constraint';
...
@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly users_service: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: at_public_key,
		});
	}
...
```

Thử lại với API GET http://localhost:3333/users. Kết quả thành công như bên dưới. Các bạn nhớ chỉnh lại key cho `JwtRefreshTokenStrategy`

![image.png](https://images.viblo.asia/7c8004fb-317a-4e4f-b996-30900c750bb1.png)

Vậy là chúng ta đã cài đặt xong khóa bất đối xứng cho JWT. Các bạn có thể thấy chúng ta dùng `at_private_key` để sign và dùng `at_public_key` để verify token.

# 6. Các trường hợp cần quan tâm

## 6.1 Xử lí khi token bị leak

## 6.2 Xử lí token cũ khi user đổi password

# Kết luận

# Tài liệu tham khảo

- https://viblo.asia/p/jwt-tu-co-ban-den-chi-tiet-LzD5dXwe5jY#_1-jwt---json-web-token-la-gi-1
- https://openbase.com/js/@nestjs/jwt
- https://jwt.io/
