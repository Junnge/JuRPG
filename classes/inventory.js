export function Inv() {
	this.stuff = {};

	this.remove = function(item, count){
		if (this.stuff[item] > count){
			this.stuff[item] -= count;
		} else if (this.stuff[item] == count){
			delete this.stuff[item];
		} else {
			throw "Not enough items";
		}
	}

	this.add = function(item, count){
		if (item in this.stuff) {
			this.stuff[item] += count
		} else {
			this.stuff[item] = count
		}
	}

	this.buy = function(item, price, amount){
		this.remove("cap", price*amount);
		this.add(item, amount);
	}

	this.sell = function(item, price, amount){
		this.remove(item, amount);
		this.add("cap", price*amount);
	}

	this.save = function(){
		localStorage.inv = JSON.stringify(this.stuff);
	}

	this.load = function(){
		this.stuff = JSON.parse(localStorage.inv);
	}
}