import { Link } from "react-router";

const Navbar: React.FC = () => {

    return (
        <div className="navbar text-light m-0 p-0 bg-primary">
            <div className="container-fluid p-3 nav-color d-flex justify-content-center">
                <div className="">
                    <h2 className="fw-bold">Video Game Sales Dashboard</h2>
                </div>
            </div>
        </div>
    );
}

export default Navbar;