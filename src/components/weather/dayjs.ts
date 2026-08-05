import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

// Плагины подключаются в одном месте: dayjs — синглтон, и модуль,
// импортировавший его напрямую из "dayjs", не увидит этих методов.
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default dayjs;
