// abstract class Animal {
// 	public abstract is_ready_to_visit: boolean;
// 	public abstract accept(visitor: ZooVisitor): void;
// }

// class Tarsier extends Animal {
// 	public is_ready_to_visit = true;
// 	public accept(visitor: ZooVisitor): void {
// 		console.log('Tarsier happy to be touched');
// 		visitor.visit(this);
// 	}
// }

// class Okapi extends Animal {
// 	public is_ready_to_visit = false;
// 	public accept(visitor: ZooVisitor): void {
// 		console.log('Okapi happy to be touched');
// 		visitor.visit(this);
// 	}
// }

// abstract class ZooVisitor {
// 	// Visitor
// 	public abstract visit(animal: Animal): void;
// }

// class AmericaVisitor extends ZooVisitor {
// 	// Concrete Visitor
// 	public visit(animal: Animal) {
// 		console.log('American visitor is visiting and touch animal');
// 	}
// }

// class ThailandVisitor extends ZooVisitor {
// 	public visit(animal: Animal) {
// 		console.log('Thailand visitor is visiting and feed animal');
// 	}
// }

// const tarsier = new Tarsier();
// const okapi = new Okapi();
// tarsier.accept(new AmericaVisitor());
// okapi.accept(new ThailandVisitor());
