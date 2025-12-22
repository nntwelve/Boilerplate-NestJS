abstract class Animal {
	public abstract is_ready_to_visit: boolean;
	public abstract touch(): void; // Ban đầu chỉ có method này
	public abstract eat(): void; // Sau một thời gian thì bổ sung thêm method
}

class Tarsier extends Animal {
	public is_ready_to_visit = true;
	public touch() {
		// Ban đầu chỉ có method này
		console.log('Tarsier happy to be touched');
	}
	public eat() {
		// Sau một thời gian thì bổ sung thêm method
		console.log('Tarsier is eating');
	}
}

class Okapi extends Animal {
	public is_ready_to_visit = false;
	public touch() {
		// Ban đầu chỉ có method này
		console.log('Okapi happy to be touched');
	}
	public eat() {
		// Sau một thời gian thì bổ sung thêm method
		console.log('Okapi is eating');
	}
}

class Zoo {
	private animals: Animal[] = [];

	public add_animal(animal: Animal) {
		this.animals.push(animal);
	}

	public touch_animals() {
		// Ban đầu chỉ có method này
		for (let animal of this.animals) {
			if (animal.is_ready_to_visit) {
				animal.touch();
			} else {
				console.log(`${animal.constructor.name} is not ready to visit`);
			}
		}
	}

	public feed_animals() {
		// Sau một thời gian thì bổ sung thêm method
		for (let animal of this.animals) {
			if (animal.is_ready_to_visit) {
				animal.eat();
			} else {
				console.log(`${animal.constructor.name} is not ready to visit`);
			}
		}
	}
}

let zoo = new Zoo();
zoo.add_animal(new Tarsier());
zoo.add_animal(new Okapi());
zoo.touch_animals();
zoo.feed_animals();
// Output:
// Cứ mỗi lần sở thú cho phép du khách thực hiện thêm một hành động mới thì phải thay đổi tất cả các lớp con của nó.
