import prismaClient from '../lib/prisma.js'

export async function insertUser(user) {
    try {
        let response = await prismaClient.users.create({
            data: {
                name: user.email,
                email: user.email,
                password: user.password,
            },
        })
        return response;
    }
    catch (e) {
        throw e;
    }
}

export async function insertFolder(folder) {

    try {
        await prismaClient.folders.create({
            data: {
                name: folder.name,
                parent_id: folder.parent_id,
                usersId: folder.user_id,
            }
        })
    } catch (error) {
        throw error
    }
}

export async function createRootFolder(user_id) {

    try {
        await prismaClient.folders.create({
            data: {
                id: "0",
                name: "root",
                parent_id: '0',
                usersId: user_id,
            }
        })
    } catch (error) {
        throw error
    }
}




export async function insertFile(file) {

    prismaClient.files.create({
        data: {
            name: file.name,
            path: file.path,
            size: file.size,
            type: file.type,
            parent_id: file.parent_id,
            usersId: file.user_id,
        }
    }).catch((err) => {
        console.log('err');
    })

}

export async function checkIfUserExist(email) {
    const res = await prismaClient.users.findFirst({
        where: {
            email: email
        }
    })
    if (res) return true;
    return false;
}


export async function getUserByid(id) {
    const res = await prismaClient.users.findFirst({
        where: {
            id: id
        }
    })
    return res;
}

export async function getUserByEmail(email) {
    const res = await prismaClient.users.findFirst({
        where: {
            email: email
        }
    })
    return res;
}

/*async function getUserFilesById(id, parent) {
    const res = await prismaClient.files.findMany({
        where: {
            AND: { usersId: id, parent_id: parent }
        }
    })
    return res;
}*/

export async function getAllUserFolders(id) {

    try {
        const res = await prismaClient.folders.findMany({
            where: {
                usersId: id
            }
        })
        return res;

    } catch (error) {
        throw error
    }
}

export async function getAllUserFiles(id) {
    try {
        const res = await prismaClient.files.findMany({
            where: {
                usersId: id
            }
        })
        return res;

    } catch (error) {

    }
}

export async function getFileById(id, user_id) {

    const res = await prismaClient.files.findFirst({
        where: {
            AND: { id: id, usersId: user_id }
        }
    })
    return res;
}

export async function insertSharedFile(data) {

    try {
        let res = await prismaClient.share.create({
            data: {
                users_id: data.user_id,
                file_id: data.file_id,
                url: data.url,
                expires_at: data.expires_at,
            }
        })
        return res;

    } catch (error) {
        console.log(error);
        throw error;

    }
}


export async function getAllSharedUserFiles(user_id) {

    try {
        let res = await prismaClient.share.findMany({
            where: {
                users_id: user_id,
            },
            select: {
                file: {
                    select: {
                        name: true,
                    }
                },
                url: true,
                expires_at: true,
            }
        })
        return res;

    } catch (error) {
        throw error;
        console.log(error);
    }

}

export async function deleteById(id, user_id) {

    try {
        const res = await prismaClient.folders.deleteMany({
            where: {
                AND: { id: id, usersId: user_id }
            }
        })

        res = await prismaClient.files.deleteMany({
            where: {
                AND: { id: id, usersId: user_id }
            }
        })

        return res;

    } catch (error) {
        throw error;
    }


}

