export const mergeMessages = (myMessages, friendMessages) => {
    // Combine messages while alternating between myMessages and friendMessages
    const mergedMessages = [];
    let i = 0, j = 0;

    while (i < myMessages.length || j < friendMessages.length) {
        if (i < myMessages.length) {
            mergedMessages.push(myMessages[i]);
            i++;
        }
        if (j < friendMessages.length) {
            mergedMessages.push(friendMessages[j]);
            j++;
        }
    }

    return mergedMessages;
};
