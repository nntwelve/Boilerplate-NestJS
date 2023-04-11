# Đặt vấn đề

# Thông tin package

- class-validator version 0.14.0
- class-transformer version 0.5.1

# 1. Class validator

**class-validator** cung cấp các decorator để thêm validation cho các thuộc tính (properties) của đối tượng. Ví dụ, nếu chúng ta muốn đảm bảo rằng property _email_ phải có định dạng hợp lệ, chúng ta có thể sử dụng decorator `@IsEmail()` của **class-validator**. Thường chúng ta sẽ dùng validate request ( params, query, body payload, ...) để đảm bảo dữ liệu user gửi lên là hợp lệ.

> Với params và query thì mình thích dùng với Pipe dạng Parse\* hơn

## 1.1 Cài đặt

Chúng ta sẽ sử dụng **ValidationPipe** của **NestJS**, và nó cần sử dụng kết hợp với **class-validator** và **class-transfomer** nên chúng ta phải cài đặt cả 2 package này.

`npm i --save class-validator class-transformer`

Mình sẽ sử dụng cho toàn bộ ứng dụng nên sẽ appy vào **Global Pipe**. Bạn nào chưa đọc về **Request Lifecycle** có thể xem lại bài viết trước của mình [ở đây.](https://viblo.asia/p/cach-request-lifecycle-hoat-dong-trong-nestjs-y3RL1awpLao)

```typescript:main.ts
import { Logger, ValidationPipe } from '@nestjs/common';
...

async function bootstrap() {
	...
	app.useGlobalPipes(new ValidationPipe()) // <== Thêm vào đây
	await app.listen(config_service.get('PORT'), () =>
		logger.log(`Application running on port ${config_service.get('PORT')}`),
	);
}
bootstrap();
```

Các option cần lưu ý:

- `whitelist`: nếu là true, sẽ loại bỏ các property không được liệt kê với **class-validator.**
- `forbidNonWhitelisted`: nếu là true thì thay vì bỏ qua bởi `whitelist` sẽ trả về lỗi
- `skipMissingProperties`: nếu property truyền vào không tồn tại hoặc có giá trị `undefined/null` sẽ bỏ qua validate cho property đó.
- `groups`: một số schema sẽ có hơn 1 loại validation, groups giúp chúng ta phân loại, thực thi cho từng group khác nhau. Option này thường được dùng cho các Pipe bên trong **Global Pipe**.

## 1.2 Validate object

Để validation chúng ta sẽ bắt đầu cập nhật lại `CreateUserDto`

```typescript:src/modules/users/dto/create-user.dto.ts
import {
	IsEmail,
	IsNotEmpty,
	IsStrongPassword,
	MaxLength,
} from 'class-validator';

export class CreateUserDto {
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
	@MaxLength(50)
	username: string;

	@IsNotEmpty()
	@IsStrongPassword()
	password: string;

    @IsOptional()
	address?: CreateAddressDto[];
}
```

> **Lưu ý**: Nếu các bạn dùng `this.users_repository.create(create_user_dto)` để lưu trữ data từ `CreateUserDto` vào database nếu không kiểm tra kỹ có thể tạo ra một lỗ hỏng. Ví dụ trong **User** schema có property `point` là số tiền user nạp vào, nếu chúng ta truyền vào như trên thì rất có thể ai đó sẽ lợi dụng truyền vào `point: 99999999` khi tạo user ( mình lấy ví dụ để minh họa thôi chứ thực tế chắc ít ai để logic code tạo user như vậy ^\_^! ). Có nhiều cách để giải quyết vấn đề trên như:
>
> - Truyền từng property hợp lệ vào function `create` thay vì toàn bộ property trong `CreateUserDto`: cách này ổn nhưng nếu schema nào có nhiều property sẽ làm code dài dòng.
> - Dùng delete để delete các property không hợp lệ sau đó mới truyền vào function `create`: cách này cũng tương tự như trên
> - Tạo **Factory Pattern** để tạo các property hợp lệ: cách này hay và làm cho code rõ ràng dễ đọc hơn, tuy nhiên phải mất thời gian viết thêm Factory cho từng schema.
> - Sử dụng option `whitelist` của `ValidationPipe`: đây là cách hiện tại mình đang dùng, chỉ cần thêm option đó vào, các property nào không có decorator của **class-validator** sẽ bị bỏ qua. Đảm bảo chỉ những property trong `CreateUserDto` mới có thể đi qua `ValidationPipe`. Nếu không có decorator nào phù hợp cho property chúng ta có thể dùng decorator `@Allow`.

- Gọi **POST** http://localhost:3333/users để tạo user và kiểm tra kết quả
  - Các property không hợp lệ sẽ trả về lỗi
    ![image.png](https://images.viblo.asia/43ca7fee-1961-4705-bcf8-dacab21e2c5f.png)
  - Thử với trường hợp dữ liệu hợp lệ và kèm với `point`. Có thể thấy dù đã gửi lên nhưng sẽ bị `ValidationPipe` loại ra
    ![image.png](https://images.viblo.asia/498c7a09-f8dc-40cb-8015-e1192e8daff9.png)

Tiếp theo chúng ta sẽ đến với `UpdateUserDto`

```typescript:src/modules/users/dto/update-user.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	MaxLength,
} from 'class-validator';
import { GENDER } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
	OmitType(CreateUserDto, ['email', 'password', 'username']),
) {
	@IsOptional()
	@IsPhoneNumber()
	phone_number?: string;

	@IsOptional()
	@IsDateString()
	date_of_birth?: Date;

	@IsOptional()
	@IsEnum(GENDER)
	gender?: string;

	@IsOptional()
	@MaxLength(200)
	headline?: string;
}
```

- Vì là update đa số chỉ cần cập nhật một số property nên chúng ta sẽ dùng `PartialType` chuyển các property của `CreateUserDto` về trạng thái _optional_. Tuy nhiên đôi khi chúng ta cũng sẽ cần loại bỏ một số property tùy theo logic nghiệp vụ như username, email, password để tránh không cho user cập nhật trong các API nhất định, do đó mình dùng `OmitType` để loại bỏ các property đó.
  > Các method hữu ích khác như: `PickType(DTOObject, ['field_name'] as const)`, `IntersectionType(DTO1, DTO2)`
- **Lưu ý**: mình dùng mapped types từ **@nestjs/swagger** chứ không dùng của **@nestjs/mapped-types** vì theo khuyến nghị từ tài liệu của NestJS "_Therefore, if you used **@nestjs/mapped-types** (instead of an appropriate one, either **@nestjs/swagger** or **@nestjs/graphql** depending on the type of your app), you may face various, undocumented side-effects._" và do series này tiếp theo mình sẽ dùng Swagger cho API docs.
  - Cài đặt **@nestjs/swagger**: `npm install --save @nestjs/swagger`
  - Chúng ta cũng cần thêm vào `"plugins": ["@nestjs/swagger"]` trong **nest-cli.json** do khác với **@nestjs/mapped-types**, mặc định `PartialType` của **@nestjs/swagger** không làm cho các property _optional_ ( xem thêm [ở đây](https://github.com/nestjs/swagger/issues/1043) ).
    ```json:nest-cli.json
    {
       "$schema": "https://json.schemastore.org/nest-cli",
       "collection": "@nestjs/schematics",
       "sourceRoot": "src",
       "compilerOptions": {
           "deleteOutDir": true,
           "plugins": ["@nestjs/swagger"] // <=== Thêm vào đây
       }
    }
    ```
- Gọi đến API **PATCH** http://localhost:3333/users/:id để cập nhật user và kiểm tra kết quả
  - Với dữ liệu không hợp lệ
    ![image.png](https://images.viblo.asia/122ac9d2-20d0-43ca-845b-ccb702a4d75f.png)
  - Dữ liệu hợp lệ thì các trường được thêm vào sẽ được cập nhật. Có thể thấy chúng ta cập nhật được cả field `first_name` từ `CreateUserDto`.
    ![image.png](https://images.viblo.asia/b5bb5678-45c7-4620-952e-89d4bc559141.png)

## 1.3 Validate nested object

Trong một số trường hợp nhất định, payload chúng ta gửi đi có thể bao gồm _nested object_, khi đó chúng ta cũng cần đảm bảo giá trị gửi lên bên trong _nested object_ phải được validate. Ví dụ cụ thể với property address bên trong user mà chúng ta đã dùng để minh họa quan hệ one-to-one ở bài viết trước.

- Đầu tiên chúng ta cập nhật lại `CreateAddressDto` để validate cho các property truyền vào khi cần tạo address. Cách validation cũng tương tự như các module trên, chỉ có `postal_code` chúng ta sẽ dùng method `IsPostalCode` để đảm bảo tính thực tế.

```typescript:src/modules/users/dto/create-address.dto.ts
import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPostalCode,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateAddressDto {
	@IsOptional()
	@MinLength(2)
	@MaxLength(120)
	street?: string;

	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(50)
	state: string;

	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(50)
	city: string;

	@IsOptional()
	@IsNumber()
	@IsPostalCode('US')
	postal_code: number;

	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(50)
	country: string;
}
```

- Sau đó thêm `CreateAddressDto` vào `CreateUserDto` với property address

```typescript:src/modules/users/dto/create-user.dto.ts
import { CreateAddressDto } from './create-address.dto';
import { Type } from 'class-transformer';
...
export class CreateUserDto {
	...
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateAddressDto)
	address?: CreateAddressDto;
}
```

- Giải thích:
  - `ValidateNested`: đầu tiên để validate nested object chúng ta cần dùng decorator này, giúp class-validator đi đến các object bên trong.
  - `Type`: `ValidateNested` thôi thì vẫn chưa đủ dữ liệu address được gửi lên phải được transform về instance của **Address class** để **class-validator** có thể validate. `Type` được import từ package **class-transformer** mà phần sau chúng ta sẽ tìm hiểu.

    => Do đó chỉ cần thiếu một trong 2 decorator trên thì validate cho property đó sẽ bị bỏ qua.
- Tiến hành test thử:
  - Thiếu các property bắt buộc sẽ báo lỗi:
    ![image.png](https://images.viblo.asia/1e1ef8b0-fdd2-49f5-809c-822406f90206.png)
  - Không truyền address trong lúc tạo thì sẽ bỏ qua validate cho address do chúng ta dùng `IsOptional`:
    ![image.png](https://images.viblo.asia/b90edabe-1008-44d7-9fb5-b0c2d755dec7.png)
  - Trường hợp tắt 1 trong 2 decorator `ValidateNested` hoặc `Type` thì dù gửi address lên nhưng validate cho property của address vẫn sẽ bị bỏ qua, vì thế chúng ta gặp validate ở **mongoose**.
    ![](https://images.viblo.asia/b1d0cdb3-8a04-4dc5-ad48-5f75c98f6b90.gif)

## 1.4 Validate Array

Trong trường hợp các bạn muốn validate các item bên trong Array chúng ta sẽ dùng các decorator `@IsArray`, `@ArrayMinSize` hoặc `@ArrayMaxSize`. Ví dụ chúng ta sẽ thêm property `interested_languages` cho User schema để biểu thị các ngon ngữ mà user hứng thú. Khi tạo user sẽ gửi các ngôn ngữ đó với payload.

- Thêm property `interested_languages` vào **user.entity.ts**

```typescript:src/modules/users/entities/user.entity.ts
export enum LANGUAGES {
	ENGLISH = 'English',
	FRENCH = 'French',
	JAPANESE = 'Japanese',
	KOREAN = 'Korean',
	SPANISH = 'Spanish',
}
...
    @Prop({
		type: [String],
		enum: LANGUAGES,
	})
	interested_languages: LANGUAGES[];
    ...
```

- Cập nhật `CreateUserDto`, đảm bảo nếu user gửi lên `interested_languages` thì mảng phải có ít nhất 1 phần tử và các phần tử mảng phải thuộc enum `TOPIC`

```typescript:src/modules/users/dto/create-user.dto.ts
import { LANGUAGES } from '../entities/user.entity';
...
export class CreateUserDto {
    @IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@IsEnum(LANGUAGES, { each: true })
	interested_languages: LANGUAGES[];
    ...
```

- Giải thích:
  - `IsOptional`: vì chúng ta không bắt buộc user phải gửi address nên nếu không có thì sẽ bỏ qua không cần các trigger các decorator bên dưới.
  - `IsArray`: bắt buộc data gửi lên phải là array
  - `ArrayMinSize`: để tránh trường hợp user gửi mảng rỗng ( trong ví dụ của chúng ta không cần check cái này cũng được, nhưng trong một vài trường hợp thực tế phải đảm bảo mảng gửi lên không được rỗng )
  - `IsEnum( each: true )`: option each giúp validate từng phần tử trong mảng
- Tiến hành kiểm tra thử để xem kết quả:
  - GIF

## Validate Array Object

Đôi khi trong một vài trường hợp bên trong Array là Object thì chúng ta cũng sẽ bắt buộc cần phải validate. Ví dụ có yêu cầu từ phía khách hàng yêu cầu thay đổi cho phép user lưu nhiều address, khi này chúng ta cần phải chỉnh sửa lại:

- Chỉnh sửa lại property address trong User Schema thành Array

```typescript:src/modules/users/entities/user.entity.ts
...
    @Prop({
		type: [
			{
				type: AddressSchema,
			},
		],
	})
	address: Address[];
    ...
```

- Cập nhật `CreateUserDto`, đảm bảo nếu user gửi lên address thì mảng phải có ít nhất 1 phần tử và các phần tử mảng phải thuộc validate với `CreateAddressDto`

```typescript:
...
export class CreateUserDto {
    ...
    @IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateAddressDto)
	address?: CreateAddressDto[];
    ...
```

- Tiến hành kiểm tra thử để xem kết quả:
  - GIF

# 2. Serialization với class-transformer

## 2.1 Cài đặt

Chúng ta đã cài đặt class-transformer ở trên cùng với class-validator.

## 2.2 Cách sử dụng

- Ví dụ ở đây mình sẽ thêm property stripe_customer_id để sau này dùng thanh toán với _Stripe_, sau đó sử dụng decorator @Exclude loại bỏ property đó của user khỏi các response.

```typescript:src/modules/users/entities/user.entity.ts
import { Exclude } from 'class-transformer';
...
    @Prop({
		default: 'cus_mock_id',
	})
	@Exclude()
	stripe_customer_id: string;
```

Thử tạo lại user xem property stripe_customer_id có bị loại bỏ chưa.
![Đang tải lên image.png…]()

- Có thể thấy vẫn chưa như chúng ta mong đợi, chúng ta cần thêm một bước là dùng Interceptors nữa mới có thể apply logic đó. Ở đây mình sẽ apply cho toàn bộ các API trong user module nên dùng `ClassSerializerInterceptor` cho **Controller Interceptor** bạn nào chưa hiểu về Request Lifecycle của NestJS có thể xem lại [bài viết của mình ở đây](https://viblo.asia/p/cach-request-lifecycle-hoat-dong-trong-nestjs-y3RL1awpLao).

```typescript:src/modules/users/users.controller.ts
import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
...
```

- Thử gọi API get lại user chúng ta vừa tạo
- Hinh
- Lần này không những property stripe_customer_id không mất mà còn kéo theo hàng loạt property lạ khác của MongoDB. Nguyên nhân không phải do chúng ta sai, mà là do response của MongoDB không tương thích với cách mà class-transformer response. Để giải quyết vấn đề đó, chúng ta cần custom lại ClassSerializerInterceptor để đồng nhất cách response giữa 2 package trên.

```typescript:src/interceptors/mongoose-class-serializer.interceptor.ts
import {
	ClassSerializerInterceptor,
	PlainLiteralObject,
	Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { Document } from 'mongoose';

function MongooseClassSerializerInterceptor(
	classToIntercept: Type,
): typeof ClassSerializerInterceptor {
	return class Interceptor extends ClassSerializerInterceptor {
		private changePlainObjectToClass(document: PlainLiteralObject) {
			if (!(document instanceof Document)) {
				return document;
			}
			return plainToClass(classToIntercept, document.toJSON());
		}

		private prepareResponse(
			response:
				| PlainLiteralObject
				| PlainLiteralObject[]
				| { items: PlainLiteralObject[]; count: number },
		) {
			if (!Array.isArray(response) && response?.items) {
				const items = this.prepareResponse(response.items);
				return {
					count: response.count,
					items,
				};
			}

			if (Array.isArray(response)) {
				return response.map(this.changePlainObjectToClass);
			}

			return this.changePlainObjectToClass(response);
		}

		serialize(
			response: PlainLiteralObject | PlainLiteralObject[],
			options: ClassTransformOptions,
		) {
			return super.serialize(this.prepareResponse(response), options);
		}
	};
}

export default MongooseClassSerializerInterceptor;
```

- Giải thích:
  - Chúng ta sẽ tạo ra 1 **HoC** với mục đích nhận vào schema.
  - Sau đó chúng ta return về custom class kế thừa `ClassSerializerInterceptor` để overide lại method `serialize` của nó.
  - Các bạn chú ý để method `prepareResponse`, đây là nơi chúng ta kiểm tra trước khi serialize response.
    - Ở dòng `if (!Array.isArray(response) && response?.items)` mình dùng để xử lý cho method `findAll`. Chúng ta gọi đệ quy bên trong dùng cho trường hợp schema có nested object bên trong ( ví dụ user bên trong flash-card ).
    - Dòng `if (Array.isArray(response))` dùng để trả về cho trường hợp response là array ( ví dụ address bên trong user, sau khi đệ quy ở if đầu tiên sẽ gặp dòng if này và trả về kết quả ).
  - Với method `changePlainObjectToClass` sẽ là nơi chính chúng ta giải quyết vấn đề không đồng nhất giữa mongoose và class-transfomer. `if (!(document instanceof Document))` nếu response không phải là Document của mongoose thì chúng ta sẽ trả về. Ngược lại nếu là Document chúng ta cần chuyển nó về JSON sau đó transfer sang Class của Schema đó.

```typescript:src/modules/users/users.controller.ts
import { UseInterceptors } from '@nestjs/common';
import { User } from './entities/user.entity';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose-class-serializer.interceptor';
@UseInterceptors(MongooseClassSerializerInterceptor(User)) // Lưu ý không được quên User schema
export class UsersController {
...
```

- Thử lại xem kết quả đã hoạt động chưa

Có thể thấy chúng ta đã thành công loại bỏ các property mình muốn khỏi response. Có nhiều option khác để các bạn có thể sử dụng như:

- Đối với các schema cần loại bỏ nhiều property thì chúng ta có thể dùng @Exclude sau đó dùng @Expose để hiển thị các property cần thiết

```typescript:src/modules/user-roles/entities/user-role.entity.ts
import { Exclude, Expose } from 'class-transformer';
...
@Exclude()
export class UserRole extends BaseEntity {
	@Prop({
		unique: true,
		default: USER_ROLE.USER,
		enum: USER_ROLE,
		required: true,
	})
	@Expose()
	name: USER_ROLE;

	@Prop()
	description: string;
}
...
```

- Trong trường hợp các bạn thiết kế các property private bắt đầu với prefix "_" thì có thể dùng option như sau `excludePrefixes: ["_"]` để mặc định loại bỏ các property bắt đầu bằng "\_".

```typescript:src/interceptors/mongoose-class-serializer.interceptor.ts
...
export function MongooseClassSerializerInterceptor(
	classToIntercept: Type,
): typeof ClassSerializerInterceptor {
    return class Interceptor extends ClassSerializerInterceptor {
        private changePlainObjectToClass(document: PlainLiteralObject) {
            if (!(document instanceof Document)) { return document }
            return plainToClass(classToIntercept, document.toJSON(), { excludePrefixes: ['_'] });
        }
        ...
```

## 2.1 planToClass

Ở mục 1 chúng ta đã dùng Type của class-transformer để chuyển dữ liệu người dùng gửi lên sang class để class-validator có thể hoạt động với kiểu dữ liệu dạng nested object.

## Working with nested objects

## Exposing properties with different names

## Skipping specific properties

## Skipping private properties, or some prefixed properties

## Using groups to control excluded properties
