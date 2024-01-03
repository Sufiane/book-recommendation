export class SocialNetworkQueries {
    cachedUserData

    constructor({fetchCurrentUser}) {
        this.fetchCurrentUser = fetchCurrentUser;
    }

    async getUserData() {
        try {
            this.cachedUserData = await this.fetchCurrentUser()

            return this.cachedUserData
        } catch {
            return this.cachedUserData
        }
    }

    getUnfilteredData(currentUser) {
        const potentialBooksMap = new Map()

        currentUser.friends.forEach((currentFriend) => {
            if (currentFriend.likes == null || currentFriend.likes.length === 0) {
                return
            }

            const likesWODuplicates = new Set(currentFriend.likes)

            likesWODuplicates.forEach(like => {
                if (currentUser.likes.includes(like)) {
                    return
                }

                const counter = potentialBooksMap.get(like)

                if (counter != null) {
                    potentialBooksMap.set(like, counter + 1)
                } else {
                    potentialBooksMap.set(like, 1)
                }
            })
        })

        return Array.from(potentialBooksMap).reduce((acc, [key, value]) => {
            acc.push({
                name: key,
                counter: value
            })

            return acc
        }, [])
    }

    getFilteredData(data, minimalScore, totalFriends) {
        const filteredData = data.filter(book => {
            return minimalScore === 0 || book.counter > totalFriends * minimalScore;
        })

        filteredData.sort((book1, book2) => {
            if (book1.counter > book2.counter) {
                return -1
            }

            if (book1.counter < book2.counter) {
                return 1
            }

            if (book1.counter === book2.counter) {
                return book1.name.localeCompare(book2.name, "en", {sensitivity: "base"})
            }
        })

        return filteredData
    }

    async findPotentialLikes(minimalScore) {
        const currentUser = await this.getUserData()

        if (currentUser?.friends == null || currentUser.friends?.length === 0) {
            return []
        }

        const potentialBooksArray = this.getUnfilteredData(currentUser)

        const totalFriends = currentUser.friends.length

        const filteredResult = this.getFilteredData(potentialBooksArray, minimalScore, totalFriends)

        return filteredResult.map(book => book.name)
    }

}
