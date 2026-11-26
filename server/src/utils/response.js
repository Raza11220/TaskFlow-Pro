export const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendPaginated = (res, data = [], pagination = {}, message = 'Data retrieved successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(pagination.page) || 1,
      limit: Number(pagination.limit) || 20,
      total: Number(pagination.total) || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 20)) || 1,
    },
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'ERROR', errors = null) => {
  const response = {
    success: false,
    message,
    code,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};
