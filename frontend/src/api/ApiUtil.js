export function createResult(axiosResponse) {
    return { 
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        status: axiosResponse.status, 
        data: axiosResponse.data 
    };
}

export function catchAxiosError(requetHandler) {
    return new Promise(async (resolve,reject) => {
            try {
                const result = await requetHandler();
                resolve(result);
            }
            catch(error) {
                if (error.name === 'AxiosError') {
                    // TODO: handle connection refuse 

                    const code = error.code;
                    if (code === 'ERR_NETWORK') {
                        reject({
                            description: 'network issue',
                        })
                    }
                    else {
                        const result = {
                            status: error.status,
                            data: error.response.data
                        }
    
                        if (result.data?.details) {
                            const errors = result.data.details.reduce((acc, item) => {
                                const { explain, key } = item;
                                acc[key] = explain;
                                return acc;
                            }, {});
                            result.errors = errors;
                        }
                        if (result.data?.description) {
                            result.errors = { description: result.data?.description, ...(result.errors || {}) };
                        }
                        resolve(result);
                    }
                }
                else {
                    reject(error);
                }
            }
        });
}