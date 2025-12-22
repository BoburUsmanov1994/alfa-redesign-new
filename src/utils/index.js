import {includes, isEqual, get, isArray} from "lodash";
import dayjs from "dayjs";

const addDetectClick = ({setOpen, classNames = []}) => {
    window.addEventListener("click", (e) => {
        if (!classNames.some(className => e.target.classList.contains(className))) {
            setOpen(false);
        }
    });
}
const removeDetectClick = () => {
    window.removeEventListener('click', addDetectClick, false);
}
export const checkBeforeCurrentTime = (time) => {
    const now = new Date();
    const validTo = new Date(time);
    return validTo < now;
};


const hasAccess = (roles = [], can = '') => {
    let access = false;
    if (includes(roles, can)) {
        access = true;
    }
    return access;
}

const formatDate = (date) => {

    date = new Date(date);
    let day = date.getDate();
    let monthIndex = date.getMonth() + 1;
    let year = date.getFullYear();

    return monthIndex < 10 ? `${day}/0${monthIndex}/${year}` : `${day}/${monthIndex}/${year}`;
}


const getSelectOptionsListFromData = (data = [], value = 'id', label = 'title') => {
    return isArray(data) ? data?.map(item => ({
        value: item[value],
        label: isArray(label) ? label.map(_label => get(item, _label))?.join(' ') : get(item, label),
        option: item
    })) : [];
}

const getFieldType = (type = 'String') => {
    if (isEqual(type, 'Date')) {
        return 'datepicker';
    }

    if (isEqual(type, 'Schema.Types.ObjectId')) {
        return 'select';
    }


    return 'input';
}

const saveFile = (file, name = dayjs(), extension = 'xlsx') => {
    const blob = new Blob([file]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
}
const stripNonDigits = (value) => value?.replace(/\D/g, '');

const disablePastDates = (current) => {
    return current && current < dayjs().startOf('day');
};
const DATE_TIME_FIELDS = new Set([
    'eventDateTime',
]);

const formatDatesDeep = (
    data,
    keyPath = []
) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
        return data;
    }
    if (dayjs.isDayjs(data)) {
        const fieldName = keyPath[keyPath.length - 1];

        if (DATE_TIME_FIELDS.has(fieldName)) {
            return data.format('YYYY-MM-DD HH:mm:ss');
        }

        return data.format('YYYY-MM-DD');
    }

    if (Array.isArray(data)) {
        return data.map((item) => formatDatesDeep(item, keyPath));
    }

    if (data && typeof data === 'object') {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                formatDatesDeep(value, [...keyPath, key]),
            ])
        );
    }

    return data;
};
export {
    addDetectClick,
    removeDetectClick,
    hasAccess,
    getSelectOptionsListFromData,
    formatDate,
    getFieldType,
    saveFile,
    stripNonDigits,
    disablePastDates,
    formatDatesDeep
}
