"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProfile = void 0;
exports.convertDaysToDate = convertDaysToDate;
const formatProfile = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        followers: user.followers.length,
        followings: user.followings.length,
    };
};
exports.formatProfile = formatProfile;
function convertDaysToDate(daysString) {
    const days = parseInt(daysString);
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);
    return targetDate;
}
//# sourceMappingURL=helper.js.map