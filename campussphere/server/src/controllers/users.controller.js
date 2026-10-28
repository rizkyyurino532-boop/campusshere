import { usersService } from '../services/users.service.js';

export function searchMembers(req, res, next) {
  try {
    const { q = '', role = 'ALL' } = req.query;
    const users = usersService.searchUsers({ query: q, role });
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil direktori anggota kampus.',
      data: { users },
    });
  } catch (err) {
    next(err);
  }
}

export function getMemberByUsername(req, res, next) {
  try {
    const currentUserId = req.user?.id || null;
    const result = usersService.getUserProfileByUsername(
      req.params.username,
      currentUserId
    );
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil profil anggota kampus.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export function updateMyProfileHandler(req, res, next) {
  try {
    const updatedUser = usersService.updateMyProfile(
      req.user.id,
      req.body || {}
    );
    res.status(200).json({
      success: true,
      message: 'Profil Anda berhasil diperbarui.',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMyPasswordHandler(req, res, next) {
  try {
    await usersService.updateMyPassword(req.user.id, req.body || {});
    res.status(200).json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui dengan aman.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

export function followMemberHandler(req, res, next) {
  try {
    const result = usersService.followUser(req.user.id, req.params.userId);
    res.status(200).json({
      success: true,
      message: `Berhasil mengikuti ${result.targetUser.fullName}.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export function unfollowMemberHandler(req, res, next) {
  try {
    const result = usersService.unfollowUser(req.user.id, req.params.userId);
    res.status(200).json({
      success: true,
      message: `Berhenti mengikuti ${result.targetUser.fullName}.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
