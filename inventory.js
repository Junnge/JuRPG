
export class Inv {
	constructor(){
		this.stuff = {};
	}
	
	remove(item, count){
		if (this.stuff[item] > count){
			this.stuff[item] -= count;
		} else if (this.stuff[item] == count){
			delete this.stuff[item];
		} else {
			throw "Not enough items";
		}
	}
	
	add(item, count){
		if (item in this.stuff) {
			this.stuff[item] += count
		} else {
			this.stuff[item] = count
		}
	}
	
	buy(item, price, amount){
		// order of following 2 lines is important
		this.remove("cap", price*amount);
		this.add(item, amount);
	}

	sell(item, price, amount){
		// order of these 2 lines is also important
		this.remove(item, amount);
		this.add("cap", price*amount);
	}
	
	open_container(item){ // takes Item object itself, not an id
		this.remove(item.id, 1);
		for (var id in item.container){
			var amount = item.container[id];
			this.add(id, amount)
		}
			
	save(){
		localStorage.inv = JSON.stringify(this.stuff);
	}
	
	load(){
		this.stuff = JSON.parse(localStorage.inv);
	}
}
