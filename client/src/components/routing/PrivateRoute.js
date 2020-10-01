import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const PrivateRoute = ({ component: Component, auth: { isAuthenticated, loading }, ...rest }) => (
    //if the user is not logged in, redirect them to the login page
    //else, direct them to dashboard
    //this keeps users that are not logged in from accessing the dashboard
    <Route {...rest} render={props => !isAuthenticated && !loading ? (
        <Redirect to='/login' />) : (
            <Component {...props} />)}
    />
)
PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
})
export default connect(mapStateToProps)(PrivateRoute)
