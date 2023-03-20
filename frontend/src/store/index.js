import Vue from "vue";
import Vuex from "vuex";

import router from '../router';
import { loginUser } from '@/api/auth';
import { getUserInfo, refreshAccessToken, logoutUser } from '@/api/users';

import {
  getAccessFromCookie,
  getRefreshFromCookie,
  getUserFromCookie,
  getCenterFormCookie,
  saveAccessToCookie,
  saveRefreshToCookie,
  saveUserToCookie,
  saveCenterToCookie,
  deleteCookie
} from '@/utils/cookies'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userid: getUserFromCookie() || '',
    accessToken: getAccessFromCookie() || '',
    refreshToken: getRefreshFromCookie() || '',
    center: getCenterFormCookie() || ''
  },
  getters: {
    isLogin (state) {
      return !!state.accessToken && !!state.refreshToken
    }
  },
  mutations: {
    setUserid (state, userid) {
      state.userid = userid
    },
    clearUserid (state) {
      state.userid = ''
    },
    setAccessToken (state, accessToken) {
      state.accessToken = accessToken
    },
    setRefreshToken (state, refreshToken) {
      state.refreshToken = refreshToken
    },
    clearToken (state) {
      state.accessToken = ''
      state.refreshToken = ''
    },
    setCenter (state, center) {
      state.center = center
    },
    clearCenter (state) {
      state.center = ''
    }
  },
  actions: {
    async Login ({ commit, dispatch }, data) {
      try {
        const res = await loginUser (data)

        commit('setAccessToken', res.data.access)
        commit('setRefreshToken', res.data.refresh)
        commit('setUserid', data.username)

        saveAccessToCookie(res.data.access)
        saveRefreshToCookie(res.data.refresh)
        saveUserToCookie(data.username)

        dispatch('getUserInfo')
      } catch (error) {
        return error.response.status
      }
    },
    async getUserInfo ({ commit }) {
      try {
        const res = await getUserInfo(this.state.userid)
        const center = res.data.center
        
        if (center) {
          commit('setCenter', center)
          saveCenterToCookie(center)
        } else {
          router.push({
            name: 'ApplyCenter'
          })
        }
      } catch (err) {
        console.log('getUserInfo error: ', err)
      }
    },
    async Logout ({ state, commit }) {
      try {
        await logoutUser({
          refresh: state.refreshToken
        })
        commit('clearUserid')
        commit('clearToken')
        commit('clearCenter')

        deleteCookie('til_user')
        deleteCookie('til_access')
        deleteCookie('til_refresh')
        deleteCookie('til_center')
      } catch (err) {
        console.log('Logout error: ', err)
      }
    },
    async refreshAccessToken ({ commit }) {
      try {
        const res = await refreshAccessToken({
          refresh: this.state.refreshToken
        })
        commit('setAccessToken', res.data.access)
        saveAccessToCookie(res.data.access)
      } catch (err) {
        console.log('refreshAccessToken error: ', err)
      }
    }
  },
  modules: {},
});
