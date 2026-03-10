const COMPLAINT_TYPE = [{
	val: 1,
	name: '对我造成骚扰'
}, {
	val: 2,
	name: '疑似诈骗'
}, {
	val: 3,
	name: '传播不良内容'
}, {
	val: 99,
	name: '其他不正规行为'
}]


const covertToName = (dictType, val, defName) => {
	let dictItem = dictType.find(item => item.val == val);
	return dictItem ? dictItem.name : defName;
}

export {
	COMPLAINT_TYPE,
	covertToName
}