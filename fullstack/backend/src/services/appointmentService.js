/**
 * Appointment service for managing appointments
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all appointments
 * @returns {Promise<Array>} Array of appointments
 */
const getAllAppointments = async () => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return appointments;
  } catch (error) {
    throw new Error(`Error fetching appointments: ${error.message}`);
  }
};

/**
 * Get appointments for a doctor
 * @param {number} doctorId - Doctor ID
 * @returns {Promise<Array>} Array of appointments
 */
const getDoctorAppointments = async (doctorId) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: parseInt(doctorId)
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return appointments;
  } catch (error) {
    throw new Error(`Error fetching doctor appointments: ${error.message}`);
  }
};

/**
 * Get appointments for a patient
 * @param {number} patientId - Patient ID
 * @returns {Promise<Array>} Array of appointments
 */
const getPatientAppointments = async (patientId) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: parseInt(patientId)
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return appointments;
  } catch (error) {
    throw new Error(`Error fetching patient appointments: ${error.message}`);
  }
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment
 */
const createAppointment = async (appointmentData) => {
  try {
    const { date, notes, doctorId, patientId, status = 'scheduled' } = appointmentData;
    
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        notes,
        status,
        doctor: {
          connect: { id: parseInt(doctorId) }
        },
        patient: {
          connect: { id: parseInt(patientId) }
        }
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    return appointment;
  } catch (error) {
    throw new Error(`Error creating appointment: ${error.message}`);
  }
};

/**
 * Update an appointment
 * @param {number} id - Appointment ID
 * @param {Object} appointmentData - Updated appointment data
 * @returns {Promise<Object>} Updated appointment
 */
const updateAppointment = async (id, appointmentData) => {
  try {
    const { date, notes, status } = appointmentData;
    
    const appointment = await prisma.appointment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(date && { date: new Date(date) }),
        ...(notes && { notes }),
        ...(status && { status })
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    return appointment;
  } catch (error) {
    throw new Error(`Error updating appointment: ${error.message}`);
  }
};

/**
 * Delete an appointment
 * @param {number} id - Appointment ID
 * @returns {Promise<Object>} Deleted appointment
 */
const deleteAppointment = async (id) => {
  try {
    const appointment = await prisma.appointment.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    return appointment;
  } catch (error) {
    throw new Error(`Error deleting appointment: ${error.message}`);
  }
};

module.exports = {
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
