//ф-я для генерации цельных чисел в диапазоне [min, max]
export function randomInt(min, max) {
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

export function H(arg){
	return "<a class='brackets'>["+arg+"]</a>"
}